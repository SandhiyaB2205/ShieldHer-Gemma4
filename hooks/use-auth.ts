'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import type { User, AuthResponse } from '@/types';

const AUTH_TOKEN_KEY = 'shieldher-auth-token';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

async function fetchUser(token: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    setToken(storedToken);
    setIsInitialized(true);
  }, []);

  // Fetch user data when token is available
  const { data: user, isLoading, mutate } = useSWR(
    isInitialized && token ? ['user', token] : null,
    ([, t]) => fetchUser(t),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: () => {
        // Clear invalid token
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
      }
    }
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    setToken(data.token);
    mutate(data.user);

    return data;
  }, [mutate]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    setToken(data.token);
    mutate(data.user);

    return data;
  }, [mutate]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    mutate(null);
  }, [mutate]);

  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  return {
    user: user || null,
    token,
    isLoading: !isInitialized || isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    getAuthHeaders
  };
}
