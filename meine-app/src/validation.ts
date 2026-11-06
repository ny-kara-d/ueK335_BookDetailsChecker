// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
/**
 * Prüft das Format name@domain.tld (ob die Adresse existiert, prüft erst der Server).
 * @param value Eingabe aus dem E-Mail-Feld
 * @returns true bei gültigem Format
 */
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Mindestlänge für neue Passwörter bei der Registrierung. */
export const MIN_PASSWORD = 8;

/**
 * Für optionale Zahlenfelder (Alter, Jahr, Seiten): leer ist immer gültig, sonst muss die
 * Eingabe eine ganze Zahl im erlaubten Bereich sein.
 * @param value Eingabe aus dem Textfeld
 * @param min kleinster erlaubter Wert
 * @param max grösster erlaubter Wert
 * @returns true, wenn leer oder eine ganze Zahl zwischen min und max
 */
export const isOptionalNumber = (value: string, min: number, max: number) =>
  value.trim() === '' || (/^\d+$/.test(value.trim()) && Number(value) >= min && Number(value) <= max);