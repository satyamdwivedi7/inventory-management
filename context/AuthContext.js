'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { ROLE_PERMISSIONS } from '@/lib/constants';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/register'];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [loading, user, pathname]);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      try {
        const response = await api.getProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          api.removeToken();
        }
      } catch (error) {
        api.removeToken();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await api.login(email, password);
    if (response.success) {
      setUser(response.data.user);
      router.push('/dashboard');
    }
    return response;
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    if (response.success) {
      setUser(response.data.user);
      router.push('/dashboard');
    }
    return response;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions ? permissions[permission] : false;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        hasPermission,
        hasRole,
        isAuthenticated: !!user,
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

export default AuthContext;
