// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AuthError, Book, getBooks } from '../api/client';
import { useAuth } from '../context/AuthContext';

/**
 * Lädt die Bücher, wenn der Screen sichtbar wird – so ist die Liste nach Speichern oder Löschen
 * aktuell, ohne bei jedem Rendern neu zu laden.
 * @returns books, loading, error (Text für Nutzende), retry (für «Erneut versuchen»)
 *   sowie refreshing und refresh (für Runterziehen zum Aktualisieren)
 */
export function useBooks() {
  const { logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setBooks(await getBooks());
    } catch (e) {
      if (e instanceof AuthError) return logout();
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  // Eigener Zustand statt loading: beim Runterziehen bleibt die Liste sichtbar, nur der Spinner oben dreht
  async function refresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  return { books, loading, error, refreshing, refresh, retry: () => { setLoading(true); reload(); } };
}