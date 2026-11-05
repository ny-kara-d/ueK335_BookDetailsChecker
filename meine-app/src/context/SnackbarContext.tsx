// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
// Eine Snackbar für die ganze App: Erfolg melden, optional mit «Rückgängig»
import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';

type Action = { label: string; onPress: () => void };
const SnackbarContext = createContext<(message: string, action?: Action) => void>(() => {});

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snack, setSnack] = useState<{ message: string; action?: Action } | null>(null);

  return (
    <SnackbarContext.Provider value={(message, action) => setSnack({ message, action })}>
      {children}
      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack(null)}
        action={snack?.action}
        duration={snack?.action ? 6000 : 3000}
        style={{ marginBottom: 96 }}
      >
        {snack?.message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

/**
 * Liefert showSnack(message, action?). Die Snackbar liegt im Root-Layout und bleibt darum
 * sichtbar, auch wenn danach der Screen wechselt (z. B. nach Löschen zurück zur Liste).
 */
export const useSnackbar = () => useContext(SnackbarContext);