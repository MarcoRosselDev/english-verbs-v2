import type { PublicUser } from "@/types/user";
import type { Verb } from "@/types/verb";

/**
 * LA regla de permisos, escrita una sola vez. Es una función pura (sin base de datos),
 * así que la usan tanto el servidor (para hacer cumplir) como la interfaz (para mostrar
 * u ocultar botones). Ojo: ocultar un botón es comodidad; la seguridad real es que el
 * servidor vuelva a comprobarla en cada petición.
 */
export function canModifyVerb(user: PublicUser | null, verb: Pick<Verb, "created_by">): boolean {
  if (!user) return false;
  return user.role === "admin" || verb.created_by === user.id;
}