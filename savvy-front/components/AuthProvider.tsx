'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Function to check if user is logged in
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Check if token exists
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth error:', error);
      // Handle invalid token by logging out
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount and when token changes
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect based on authentication status
  useEffect(() => {
    if (isLoading) return; // Skip during loading

    // Protected routes path prefixes
    const protectedPrefixes = ['/user'];
    const isProtectedRoute = protectedPrefixes.some(prefix => pathname?.startsWith(prefix));
    
    // Login/registration routes
    const authRoutes = ['/login', '/register'];
    const isAuthRoute = authRoutes.includes(pathname || '');

    if (isProtectedRoute && !user) {
      // Redirect to login if accessing protected route without auth
      router.push('/login');
    } else if (isAuthRoute && user) {
      // Redirect to dashboard if logged in user tries to access login/register
      router.push('/user/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  // Login function
  const login = async (token: string) => {
    localStorage.setItem('access_token', token);
    await checkAuth();
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};