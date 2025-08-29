import { useState, useCallback } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    // TODO: Replace with real authentication logic
    await new Promise(res => setTimeout(res, 500));
    setUser({ id: '1', name: username });
    setLoading(false);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; role: string }) => {
    // registration logic
    return { success: true };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    loading,
    login,
    register,
    error,
    clearError,
    logout,
    isAuthenticated: !!user,
  };
}