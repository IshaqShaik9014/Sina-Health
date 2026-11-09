import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPatient: (data: any) => Promise<any>;
  registerStaff: (data: any) => Promise<any>;
  quickLoginAs: (role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sina_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response: any = await api.get('/auth/me');
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or offline:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, passwordPlain: string) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/login', { email, password: passwordPlain });
      if (response.success && response.data) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('sina_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (data: any) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/register/patient', data);
      if (response.success && response.data) {
        const { token: receivedToken, user: receivedUser, patient } = response.data;
        localStorage.setItem('sina_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { user: receivedUser, patient };
      } else {
        throw new Error(response.error || 'Patient registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerStaff = async (data: any) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/register/staff', data);
      if (response.success && response.data) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('sina_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { user: receivedUser };
      } else {
        throw new Error(response.error || 'Staff registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAs = async (role: Role) => {
    let email = 'dr.chen@sina.health'; // Default doctor
    if (role === 'PHARMACIST') email = 'pharm.city@sina.health';
    if (role === 'PATIENT') email = 'patient.mercer@sina.health';
    if (role === 'HOSPITAL_ADMIN') email = 'admin.apex@sina.health';
    if (role === 'SUPER_ADMIN') email = 'admin@sina.health';

    await login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('sina_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerPatient,
        registerStaff,
        quickLoginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
