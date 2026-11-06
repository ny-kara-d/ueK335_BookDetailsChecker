// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { User } from './api/client';

/**
 * Kürzel für den Avatar: erster Buchstabe von Vor- und Nachname, sonst der erste Buchstabe der E-Mail.
 * @param user eingeloggte Person oder `null`
 * @returns ein oder zwei Grossbuchstaben, `"?"` ohne eingeloggte Person
 */
export function getInitials(user: User | null): string {
  if (!user) return '?';
  return ((user.firstname?.[0] ?? '') + (user.lastname?.[0] ?? '')).toUpperCase() || user.email[0].toUpperCase();
}
