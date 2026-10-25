import axios from 'axios';
import { clearAuth, loadAuth } from '../lib/storage';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/** Fired when the server rejects our token, so the UI can log the user out. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from /auth/* just means "wrong password", not "session expired".
    const isAuthCall = String(error.config?.url ?? '').startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthCall) {
      clearAuth();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);