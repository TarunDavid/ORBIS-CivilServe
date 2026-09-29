/**
 * ORBIS Auth — API Client
 * JWT-aware Axios instance with interceptor for auto-attaching tokens.
 */

import axios from 'axios';

const authApi = axios.create({
  baseURL: `http://${window.location.hostname || 'localhost'}:8000/api/`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('orbis_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 by attempting token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('orbis_refresh_token');
      if (refreshToken) {
        try {
          const resp = await axios.post(
            `http://${window.location.hostname || 'localhost'}:8000/api/accounts/token/refresh/`,
            { refresh: refreshToken }
          );
          const newAccess = resp.data.access;
          localStorage.setItem('orbis_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return authApi(originalRequest);
        } catch {
          // Refresh failed — clear tokens
          localStorage.removeItem('orbis_access_token');
          localStorage.removeItem('orbis_refresh_token');
          localStorage.removeItem('orbis_user');
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default authApi;

// --- Auth API functions ---

export interface OrbisUser {
  id: string;
  role: 'official' | 'trainer' | 'admin';
  department: string | null;
  job_role_id: string | null;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: OrbisUser;
}

export async function loginWithCredentials(
  username: string,
  password: string
): Promise<AuthResponse> {
  const resp = await authApi.post<AuthResponse>('accounts/login/', {
    username,
    password,
  });
  return resp.data;
}

export async function loginWithSSO(ssoToken: string): Promise<AuthResponse> {
  const resp = await authApi.post<AuthResponse>('accounts/sso/', {
    sso_token: ssoToken,
  });
  return resp.data;
}

export async function fetchCurrentUser(): Promise<OrbisUser> {
  const resp = await authApi.get<OrbisUser>('me');
  return resp.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    await authApi.post('accounts/logout/', { refresh: refreshToken });
  } catch {
    // Ignore errors on logout
  }
}
