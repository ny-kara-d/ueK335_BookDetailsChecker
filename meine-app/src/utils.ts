// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { User } from './api/client';

/** Kürzel aus Vor-/Nachnamen, sonst aus der E-Mail; "?" ohne Nutzer:in. */
export function getInitials(user: User | null): string {
  if (!user) return '?';
  return ((user.firstname?.[0] ?? '') + (user.lastname?.[0] ?? '')).toUpperCase() || user.email[0].toUpperCase();
}
