// Datei von Claude, Zeitgründe und Präzision
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '../client';

type AuthContextType = {
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('token').then(async (token) => {
      if (token) setEmail(await SecureStore.getItemAsync('email'));
      setLoading(false);
    });
  }, []);

  async function login(emailInput: string, password: string) {
    await apiLogin(emailInput, password);
    setEmail(emailInput);
  }

  async function register(emailInput: string, password: string) {
    await apiRegister(emailInput, password);
    setEmail(emailInput);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('email');
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ email, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}