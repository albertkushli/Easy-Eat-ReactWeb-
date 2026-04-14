import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

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

  // Initial Check
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
    };
    initAuth();
  }, [refreshSession]);

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

        // If employee with restaurant_id, fetch restaurant data
        if (user.role === 'owner' || user.role === 'staff') {
          if (user.restaurant_id) {
            try {
              const restRes = await axios.get(`${API_BASE}/restaurants/${user.restaurant_id}`);
              if (restRes.status === 200) {
                setRestaurant(restRes.data);
                console.log('📍 Restaurant data loaded:', restRes.data.profile?.name);
              }
            } catch (err) {
              console.error('Failed to load restaurant:', err);
            }
          }
        }

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
      const res = await axios.post(`${API_BASE}/auth/customer/register`, userData, {
        withCredentials: true
      });

      if (res.status === 201) {
        // Auto-login functionality
        const { accessToken, user } = res.data;
        if (accessToken && user) {
          setAuth({ accessToken, user });
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  }, []);

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

  const isAuthenticated = Boolean(auth?.accessToken);
  const role = auth?.user?.role ?? null;
  const user = auth?.user ?? null;
  const token = auth?.accessToken ?? null;

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
