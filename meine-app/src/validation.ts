// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
/** Prüft das Format name@domain.tld (ob die Adresse existiert, prüft erst der Server). */
export const isEmail =(value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const MIN_PASSWORD = 8;

/**
 * Für optionale Zahlenfelder (Alter, Jahr, Seiten).
 * @returns true, wenn leer oder eine ganze Zahl zwischen min und max
 */
export const isOptionalNumber = (value: string, min: number, max: number) =>
  value.trim() === '' || (/^\d+$/.test(value.trim()) && Number(value) >= min && Number(value) <= max);