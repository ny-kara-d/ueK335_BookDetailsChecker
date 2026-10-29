import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.110:3030'; // IP des Laptops eintragen

export type Book = { id: number; title: string; author?: string };

export async function login(email: string, password: string) {
 const response = await fetch(`${BASE_URL}/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password }),
 });
 if (!response.ok) throw new Error('E-Mail oder Passwort ist falsch.');
 const { accessToken } = await response.json();
 await SecureStore.setItemAsync('token', accessToken);
 await SecureStore.setItemAsync('email', email);
}

// Von Claude, aus Zeitgründen generiert
export async function register(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Registrierung fehlgeschlagen.');
  const { accessToken } = await response.json();
  await SecureStore.setItemAsync('token', accessToken);
  await SecureStore.setItemAsync('email', email);
}

export class AuthError extends Error {}
async function request<T>(path: string, options: RequestInit = {}):
Promise<T> {
 const token = await SecureStore.getItemAsync('token');
 const response = await fetch(`${BASE_URL}${path}`, {
 ...options,
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`,
 },
 });

 if (response.status === 401 || response.status === 403) {
 throw new AuthError('Bitte erneut anmelden.');
 }
 if (!response.ok) throw new Error(`HTTP-Fehler ${response.status}`);
 return response.json() as Promise<T>;
}


export const getBooks = () => request<Book[]>('/books');
export const getBook = (id: string) => request<Book>(`/books/${id}`);
export const createBook = (book: Omit<Book, 'id'>) =>
  request<Book>('/books', { method: 'POST', body: JSON.stringify(book) });
export const updateBook = (id: number, changes: Partial<Book>) =>
  request<Book>(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
export const deleteBook = (id: number) =>
  request<void>(`/books/${id}`, { method: 'DELETE' });