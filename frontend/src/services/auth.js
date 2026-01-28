import { api } from '../utils/api';

export const AuthAPI = {
  me:     () => api('/auth/me',      { method: 'GET' }),
  login:  (username, password) => api('/auth/login',   { method: 'POST', body: { username, password }, retryOn401: false }),
  refresh:() => api('/auth/refresh', { method: 'POST', retryOn401: false }),
  logout: () => api('/auth/logout',  { method: 'POST', retryOn401: false }),
};
