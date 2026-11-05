// Datei von Claude, Zeitgründe und Präzision (erweitert um Profil und Registrierung mit Angaben)
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister, User } from '../api/client';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (user: User & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('token').then(async (token) => {
      const saved = await SecureStore.getItemAsync('user');
      if (token && saved) setUser(JSON.parse(saved));
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    setUser(await apiLogin(email, password));
  }

  async function register(newUser: User & { password: string }) {
    setUser(await apiRegister(newUser));
  }

  // useCallback: useBooks hängt davon ab, sonst lädt die Liste endlos neu
  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Eingeloggter User und login/register/logout. Nur innerhalb von AuthProvider nutzbar. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
