import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
// By setting API_BASE to an empty string (or omitting the host), 
// requests will be made to the same origin (http://localhost:5173) 
// and then proxied to http://localhost:1337 by Vite.
const API_BASE = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_data');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [restaurant, setRestaurant] = useState(() => {
    try {
      const stored = localStorage.getItem('restaurant_data');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Persist auth state to localStorage
  useEffect(() => {
    if (auth) localStorage.setItem('auth_data', JSON.stringify(auth));
    else localStorage.removeItem('auth_data');
  }, [auth]);

  // Persist restaurant state to localStorage
  useEffect(() => {
    if (restaurant) localStorage.setItem('restaurant_data', JSON.stringify(restaurant));
    else localStorage.removeItem('restaurant_data');
  }, [restaurant]);


  // ─── Silent Refresh ─────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    try {
      // Instead of relying on the backend /auth/refresh stub which currently returns 401,
      // we rely on the localStorage data which we initialized above.
      if (auth?.accessToken) {
        return auth.accessToken;
      }
      return null;
    } catch {
      setAuth(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(auth?.accessToken);
  const role = auth?.user?.role ?? null;
  const user = auth?.user ?? null;
  const token = auth?.accessToken ?? null;

  // Initial Check (silent refresh)
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
    };
    initAuth();
  }, [refreshSession]);

  // Fetch Restaurant Data if authenticated as employee
  useEffect(() => {
    async function fetchRestaurant() {
      if ((role === 'owner' || role === 'staff') && user?.restaurant_id && !restaurant) {
        try {
          console.log('🔄 Fetching FULL restaurant data for:', user.restaurant_id);
          const res = await axios.get(`${API_BASE}/restaurants/${user.restaurant_id}/full`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.status === 200) {
            setRestaurant(res.data);
            console.log('📍 Full restaurant data loaded:', res.data.profile?.name);
          }
        } catch (err) {
          console.error('❌ Failed to load restaurant:', err);
        }
      }
    }
    
    // Only fetch if we are not loading the initial session
    if (!loading) {
      fetchRestaurant();
    }
  }, [user?.restaurant_id, role, restaurant, loading]);

  const login = useCallback(async (email, password, userType = 'customer') => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password, role: userType }, {
        withCredentials: true
      });

      if (res.status === 200) {
        const { accessToken } = res.data;
        const userPayload = res.data.customer || res.data.employee || res.data.admin;
        const user = userPayload;
        setAuth({ accessToken, user });
        // Restaurant data will be fetched by the useEffect above

        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
        console.error('Login error completo:', error);
        console.error('Response:', error.response);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      // 1. Create the customer using the existing backend endpoint
      const res = await axios.post(`${API_BASE}/customers`, userData, {
        withCredentials: true
      });

      if (res.status === 201) {
        // 2. Perform auto-login using the credentials provided during registration
        return await login(userData.email, userData.password, 'customer');
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      // Optional: notify backend we're logging out
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    } finally {
      setAuth(null);
      setRestaurant(null);
      localStorage.removeItem('auth_data');
      localStorage.removeItem('restaurant_data');
    }
  }, []);


  return (
    <AuthContext.Provider value={{
      auth,
      user,
      token,
      login,
      register,
      logout,
      refreshSession,
      isAuthenticated,
      role,
      loading,
      restaurant
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
