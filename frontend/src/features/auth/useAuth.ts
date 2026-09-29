/**
 * ORBIS Auth — React hook for authentication state.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  loginWithCredentials,
  loginWithSSO,
  logoutUser,
  fetchCurrentUser,
  type OrbisUser,
} from './authApi';

export function useAuth() {
  const [user, setUser] = useState<OrbisUser | null>(() => {
    const stored = localStorage.getItem('orbis_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSession = useCallback(
    (access: string, refresh: string, userData: OrbisUser) => {
      localStorage.setItem('orbis_access_token', access);
      localStorage.setItem('orbis_refresh_token', refresh);
      localStorage.setItem('orbis_user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
    },
    []
  );

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await loginWithCredentials(username, password);
        saveSession(data.access, data.refresh, data.user);
        return data.user;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error || 'Login failed. Please check your credentials.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [saveSession]
  );

  const ssoLogin = useCallback(
    async (ssoToken: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await loginWithSSO(ssoToken);
        saveSession(data.access, data.refresh, data.user);
        return data.user;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error || 'SSO authentication failed.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [saveSession]
  );

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('orbis_refresh_token');
    if (refresh) {
      await logoutUser(refresh);
    }
    localStorage.removeItem('orbis_access_token');
    localStorage.removeItem('orbis_refresh_token');
    localStorage.removeItem('orbis_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await fetchCurrentUser();
      localStorage.setItem('orbis_user', JSON.stringify(userData));
      setUser(userData);
    } catch {
      // If refresh fails, user might have expired token
      await logout();
    }
  }, [logout]);

  const isAuthenticated = user !== null;
  const isOfficial = user?.role === 'official';
  const isTrainer = user?.role === 'trainer';
  const isAdmin = user?.role === 'admin';

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isOfficial,
    isTrainer,
    isAdmin,
    login,
    ssoLogin,
    logout,
    refreshUser,
  };
}
