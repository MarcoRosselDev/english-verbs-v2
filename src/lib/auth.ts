import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/users";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken } from "@/lib/session";
import type { PublicUser } from "@/types/user";

const BCRYPT_COST = 12; // cada +1 duplica el tiempo de cálculo: frena ataques de fuerza bruta

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

/** Hash "señuelo". Si el email no existe igual gastamos el mismo tiempo comparando contra
 *  esto; así nadie puede descubrir qué emails están registrados midiendo cuánto tarda el login.
 *  Se calcula la primera vez que hace falta y se reutiliza. */
let dummyHash: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
  dummyHash ??= bcrypt.hash("not-a-real-password", BCRYPT_COST);
  return dummyHash;
}

export async function setSessionCookie(userId: number) {
  const token = await createSessionToken(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript del navegador NO puede leerla (protege contra XSS)
    secure: process.env.NODE_ENV === "production", // solo por HTTPS en producción
    sameSite: "lax", // no se envía en peticiones POST desde otros sitios (protege contra CSRF)
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Devuelve el usuario de la sesión actual, o null.
 * Tras verificar el token volvemos a leer al usuario en la base de datos: así, si lo
 * borras o le cambias el rol, el efecto es inmediato (un JWT por sí solo no se puede revocar).
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  return userId === null ? null : findUserById(userId);
}