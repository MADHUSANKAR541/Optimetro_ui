'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/simpleAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent and received
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response data:', data);

      if (response.ok) {
        setUser(data.user);
        console.log('✅ Login successful, user set');
        return true;
      }
      console.log('❌ Login failed:', data.error);
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔄 Checking user session...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Ensure cookies are sent
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        console.log('✅ User session found:', data.user.email);
      } else {
        // 401 is expected when user is not logged in
        if (response.status === 401) {
          console.log('ℹ️ No active session (user not logged in)');
        } else {
          console.log('❌ Session check failed:', data.error);
        }
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error checking user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only refresh user if we're in the browser (not SSR)
    if (typeof window !== 'undefined') {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
