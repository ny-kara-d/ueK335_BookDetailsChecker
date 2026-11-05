// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useEffect, useState } from 'react';

/**
 * Fehlermeldung für einen Banner, die sich nach einer Weile selbst ausblendet.
 * @param ms Anzeigedauer in Millisekunden
 * @returns [error, setError] wie bei useState
 */
export function useTemporaryError(ms = 5000) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), ms);
    return () => clearTimeout(timer);
  }, [error, ms]);

  return [error, setError] as const;
}
