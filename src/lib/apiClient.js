import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function getStoredAuthToken() {
  try {
    const stored = localStorage.getItem('auth_data');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed?.accessToken ?? null;
  } catch {
    return null;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

export default apiClient;