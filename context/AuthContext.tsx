import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setAuthToken, clearAuthToken } from '@/lib/query-client';
import { queryClient } from '@/lib/query-client';

export interface Company {
  id: string;
  name: string;
  pib: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  joinedDate: string;
}

interface AuthContextValue {
  company: Company | null;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: Omit<Company, 'id' | 'rating' | 'reviewCount' | 'joinedDate'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateCompany: (data: Partial<Company>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadAuth();
  }, []);

  async function loadAuth() {
    try {
      const [token, storedOnboarded] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_onboarded'),
      ]);
      setIsOnboarded(storedOnboarded === 'true');
      if (token) {
        try {
          const res = await apiRequest('GET', '/api/auth/me');
          const data = await res.json();
          setCompany(data);
        } catch {
          await clearAuthToken();
        }
      }
    } catch (e) {
      console.error('Failed to load auth', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string, remember: boolean = true) {
    const res = await apiRequest('POST', '/api/auth/login', { email, password });
    const data = await res.json();
    await setAuthToken(data.token, remember);
    setCompany(data.company);
    queryClient.clear();
  }

  async function register(data: Omit<Company, 'id' | 'rating' | 'reviewCount' | 'joinedDate'> & { password: string }) {
    const res = await apiRequest('POST', '/api/auth/register', data);
    const result = await res.json();
    await setAuthToken(result.token);
    setCompany(result.company);
    queryClient.clear();
  }

  async function logout() {
    setCompany(null);
    await clearAuthToken();
    queryClient.clear();
  }

  async function completeOnboarding() {
    setIsOnboarded(true);
    await AsyncStorage.setItem('auth_onboarded', 'true');
  }

  async function updateCompany(data: Partial<Company>) {
    if (!company) return;
    const res = await apiRequest('PUT', '/api/auth/profile', data);
    const updated = await res.json();
    setCompany(updated);
  }

  const value = useMemo(() => ({
    company,
    isLoading,
    isOnboarded,
    login,
    register,
    logout,
    completeOnboarding,
    updateCompany,
  }), [company, isLoading, isOnboarded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
