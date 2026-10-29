import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.25:3030'; // IP des Laptops eintragen

export type Movie = { id: number; title: string; imdbRating?: number };

export async function login(email: string, password: string) {
 const response = await fetch(`${BASE_URL}/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password }),
 });
 if (!response.ok) throw new Error('E-Mail oder Passwort ist falsch.');
 const { accessToken } = await response.json();
 await SecureStore.setItemAsync('token', accessToken);
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


export const getMovies = () => request<Movie[]>('/movies');
export const getMovie = (id: string) => request<Movie>(`/movies/${id}`);
export const createMovie = (movie: Omit<Movie, 'id'>) =>
 request<Movie>('/movies', { method: 'POST', body: JSON.stringify(movie) });
export const updateMovie = (id: number, changes: Partial<Movie>) =>
 request<Movie>(`/movies/${id}`, { method: 'PATCH', body:
JSON.stringify(changes) });
export const deleteMovie = (id: number) =>
 request<void>(`/movies/${id}`, { method: 'DELETE' });