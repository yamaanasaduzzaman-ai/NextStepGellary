'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isStaff: boolean;
  customerProfile?: any;
  adminProfile?: any;
  addresses?: any[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  guestToken: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isStaff?: boolean }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestToken, setGuestToken] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve persistent guest token
    let token = localStorage.getItem('nxg_guest_token');
    if (!token) {
      token = 'gst_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('nxg_guest_token', token);
    }
    setGuestToken(token);

    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, guestToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true, isStaff: data.user.isStaff };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        guestToken,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
