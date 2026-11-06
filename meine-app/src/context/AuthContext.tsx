// Datei von Claude, Zeitgründe und Präzision (erweitert um Profil und Registrierung mit Angaben)
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthError, login as apiLogin, register as apiRegister, updateUser, User } from '../api/client';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (user: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  /** Speichert Profiländerungen im Backend und in SecureStore; loggt bei abgelaufenem Token aus. */
  updateProfile: (changes: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Stellt Login-Status und -Aktionen für die ganze App bereit. Liegt im Root-Layout über dem
 * `Stack`, der anhand von `user` zwischen Login/Registrieren und den geschützten Screens wechselt.
 * @param children Teilbaum, der Zugriff auf `useAuth()` erhält (hier: die gesamte App)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const saved = await SecureStore.getItemAsync('user');
        if (token && saved) setUser(JSON.parse(saved));
      } catch {
        // beschädigte oder fehlende Daten: einfach ausgeloggt starten
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    setUser(await apiLogin(email, password));
  }

  async function register(newUser: Omit<User, 'id'> & { password: string }) {
    setUser(await apiRegister(newUser));
  }

  /** Reicht Änderungen ans Backend weiter und aktualisiert User-State + SecureStore. */
  async function updateProfile(changes: Partial<Omit<User, 'id' | 'email'>>) {
    if (!user) return;
    try {
      const { password, ...updated } = await updateUser(user.id, changes) as User & { password?: string };
      setUser(updated);
      await SecureStore.setItemAsync('user', JSON.stringify(updated));
    } catch (e) {
      if (e instanceof AuthError) return logout();
      throw e;
    }
  }

  // useCallback: useBooks hängt davon ab, sonst lädt die Liste endlos neu
  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch {
      // Keystore-Fehler beim Löschen: trotzdem lokal ausloggen
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
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
