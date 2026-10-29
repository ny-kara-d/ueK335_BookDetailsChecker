// Datei von Claude, Zeitgründe und Präzision
import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '../client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('token').then(async (token) => {
      if (token) setEmail(await SecureStore.getItemAsync('email'));
      setLoading(false);
    });
  }, []);

  async function login(emailInput, password) {
    await apiLogin(emailInput, password);
    setEmail(emailInput);
  }

  async function register(emailInput, password) {
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

export const useAuth = () => useContext(AuthContext);