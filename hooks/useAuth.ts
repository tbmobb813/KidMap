import { useState } from 'react';

import { login as apiLogin, register as apiRegister } from '@/utils/auth';

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const result = await apiLogin(email, password);
    setLoading(false);
    if (result.success) setUser(result.user!);
    else setError(result.error || 'Login failed');
    return result;
  };

  const register = async (data: { email: string; password: string; name: string; role: string }) => {
    setLoading(true);
    setError(null);
    const result = await apiRegister(data.email, data.password, data.name, data.role);
    setLoading(false);
    if (result.success) setUser(result.user!);
    else setError(result.error || 'Registration failed');
    return result;
  };

  const clearError = () => setError(null);

  const logout = () => setUser(null);

  return { user, loading, login, register, error, clearError, logout, isAuthenticated: !!user };
}