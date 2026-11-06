// Erweitert von Claude (KI-Einsatz, siehe Technischer Bericht): Book/User-Typen, Fehlertexte, register mit Profilangaben
// Persistenz: Bücher liegen im Backend (rest-jsondb). Lokal speichern wir nur Token und Profil,
// und zwar in SecureStore (verschlüsselt im Android-Keystore), weil der Token ein Zugangsschlüssel ist.
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Mit Expo Go läuft das Backend auf demselben Laptop wie Expo: dessen IP aus hostUri übernehmen,
// so muss niemand die IP von Hand eintragen (z. B. "192.168.1.112:8081" -> "192.168.1.112")
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
const BASE_URL = `http://${host}:3030`;

// Ohne Timeout hängt fetch() bei einem unerreichbaren Server (z. B. Firewall, falsches WLAN)
// am TCP-Timeout des Betriebssystems, das können über eine Minute sein ("unendliches" Laden).
const TIMEOUT_MS = 10000;

/** fetch() mit Timeout: bricht nach TIMEOUT_MS ab statt bei schlechter Verbindung endlos zu warten. */
async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Eine benannte Sprachnotiz. `uri` ist ein lokaler Dateipfad, nur auf diesem Gerät gültig. */
export type VoiceNote = {
  id: string;
  name: string;
  uri: string;
  createdAt: string;
};

export type Book = {
  id: number | string;
  title: string;
  author: string;
  genre: string;
  year?: number;
  pages?: number;
  description?: string;
  coverColor?: string;
  rating?: number;
  /** Sprachnotizen (Begeisterungsmerkmal, siehe VoiceNotes-Komponente). */
  voiceNotes?: VoiceNote[];
};

// Feste Auswahl statt Freitext: verhindert Schreibvarianten wie «roman» / «Roman» im Genre-Filter
export const GENRES = ['Biografie', 'Drama', 'Fantasy', 'Kinderbuch', 'Krimi', 'Lyrik', 'Roman', 'Sachbuch', 'Science-Fiction'];

export type User = { email: string; firstname?: string; lastname?: string; age?: number };

/**
 * Meldet an oder registriert und speichert Token + Profil in SecureStore.
 * json-server-auth antwortet bei /login und /register mit { accessToken, user }.
 * @param path '/login' oder '/register'
 * @param body Anmeldedaten (bei /register inkl. Vorname, Nachname, Alter)
 * @param fallback Fehlertext für Nutzende, wenn der Server ablehnt
 * @returns Profil ohne Passwort und ohne interne ID
 * @throws Error mit verständlicher Meldung (keine Verbindung, falsche Daten, E-Mail vergeben)
 */
async function auth(path: string, body: object, fallback: string): Promise<User> {
  let response: Response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Keine Verbindung zum Server. Prüfe deine Internetverbindung.');
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.includes('already exists') ? 'Diese E-Mail ist bereits registriert. Melde dich an.' : fallback);
  }
  const { accessToken, user } = await response.json();
  const { password, id, ...profile } = user;
  await SecureStore.setItemAsync('token', accessToken);
  await SecureStore.setItemAsync('user', JSON.stringify(profile));
  return profile;
}

/**
 * Meldet an bestehendem Konto an.
 * @param email E-Mail-Adresse des Kontos
 * @param password Passwort im Klartext (geht nur über HTTPS/lokales Netz, wird nie gespeichert)
 * @returns Profil der angemeldeten Person
 */
export const login = (email: string, password: string) =>
  auth('/login', { email, password }, 'E-Mail oder Passwort ist falsch. Prüfe deine Eingaben und versuche es erneut.');

/**
 * Legt ein neues Konto an.
 * @param user Pflichtfelder email/password plus optionale Profilangaben (Vorname, Nachname, Alter)
 * @returns Profil der neu angelegten Person
 */
export const register = (user: User & { password: string }) =>
  auth('/register', user, 'Registrierung fehlgeschlagen. Versuche es erneut.');

/** Token abgelaufen oder ungültig: die App meldet dann ab und zeigt den Login. */
export class AuthError extends Error {}

/**
 * Ruft einen geschützten Endpoint mit dem gespeicherten Token auf.
 * @param path z. B. '/books' oder '/books/3'
 * @param options fetch-Optionen (Methode, Body)
 * @returns die JSON-Antwort als Typ T
 * @throws AuthError bei 401/403, sonst Error mit Meldung für Nutzende
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync('token');
  let response: Response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('Keine Verbindung zum Server. Prüfe deine Internetverbindung und versuche es erneut.');
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthError('Bitte erneut anmelden.');
  }
  if (!response.ok) {
    // Statuscode nur fürs Debugging loggen: Nutzende sollen laut ISO 9241-110 (Fehlertoleranz)
    // und Nielsen-Heuristik 9 eine Meldung in Klartext sehen, keinen rohen Fehlercode.
    console.error(`Serverfehler bei ${path}: HTTP ${response.status}`);
    throw new Error('Unerwarteter Serverfehler. Versuche es erneut.');
  }
  return response.json() as Promise<T>;
}

/** Lädt den gesamten Buchkatalog. */
export const getBooks = () => request<Book[]>('/books');

/** Lädt ein einzelnes Buch anhand seiner ID. */
export const getBook = (id: string) => request<Book>(`/books/${id}`);

/**
 * Legt ein neues Buch im Katalog an.
 * @param book Buchdaten ohne `id` (wird vom Backend vergeben)
 * @returns das angelegte Buch inkl. der neuen `id`
 */
export const createBook = (book: Omit<Book, 'id'> & { id?: Book['id'] }) =>
  request<Book>('/books', { method: 'POST', body: JSON.stringify(book) });

/**
 * Aktualisiert einzelne Felder eines Buchs (z. B. nach dem Bearbeiten oder bei neuen Sprachnotizen).
 * @param id ID des zu ändernden Buchs
 * @param changes nur die zu ändernden Felder, der Rest bleibt unverändert (PATCH)
 */
export const updateBook = (id: Book['id'], changes: Partial<Book>) =>
  request<Book>(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });

/** Löscht ein Buch endgültig aus dem Katalog. */
export const deleteBook = (id: Book['id']) =>
  request<void>(`/books/${id}`, { method: 'DELETE' });
