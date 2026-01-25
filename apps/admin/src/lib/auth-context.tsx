'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, User } from './api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requireMfa?: boolean; mfaToken?: string } | void>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  const refreshUser = React.useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setUser(null);
        return;
      }

      const userData = await auth.me();
      setUser(userData);
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const result = await auth.login(email, password);

    if (result.requireMfa && result.mfaToken) {
      return { requireMfa: true, mfaToken: result.mfaToken };
    }

    if (result.accessToken && result.refreshToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      await refreshUser();
      router.push('/');
    }
  }, [refreshUser, router]);

  const verifyMfa = React.useCallback(async (mfaToken: string, code: string) => {
    const result = await auth.verifyMfa(mfaToken, code);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    await refreshUser();
    router.push('/');
  }, [refreshUser, router]);

  const logout = React.useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Ignore logout API errors
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  }, [router]);

  React.useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    init();
  }, [refreshUser]);

  React.useEffect(() => {
    if (isLoading) return;

    if (!user && !isPublicPath) {
      router.push('/login');
    } else if (user && isPublicPath) {
      router.push('/');
    }
  }, [user, isLoading, isPublicPath, router]);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      verifyMfa,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, verifyMfa, logout, refreshUser]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
