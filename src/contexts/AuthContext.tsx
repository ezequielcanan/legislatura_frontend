import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axiosInstance from '../config/axios.config';
import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ChangePasswordData,
  AuthContextType,
} from '../types/auth.types';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  const refreshProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get<User>('/auth/profile');
      updateUser(response.data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  }, [pathname]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          // Opcionalmente, validar el token obteniendo el perfil
          await refreshProfile();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshProfile]);

  const saveAuthData = (data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      saveAuthData(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', credentials);
      saveAuthData(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse');
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAuthData();
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const forgotPassword = async (email: string) => {
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al solicitar restablecimiento');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await axiosInstance.post('/auth/reset-password', { token, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al restablecer contraseña');
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      await axiosInstance.post('/auth/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await axiosInstance.get(`/auth/verify-email/${token}`);
      if (user) {
        updateUser({ ...user, isEmailVerified: true });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar email');
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await axiosInstance.post('/auth/resend-verification', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reenviar verificación');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    resendVerification,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}