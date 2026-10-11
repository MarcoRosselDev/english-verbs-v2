import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días, en segundos

/** Este archivo NO importa next/headers ni la base de datos a propósito:
 *  así también lo puede usar proxy.ts, que corre antes que todo lo demás. */
function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

/** Crea un JWT firmado. Solo guarda el id (claim estándar "sub"): ningún dato sensible,
 *  porque el contenido de un JWT lo puede leer cualquiera (solo está FIRMADO, no cifrado). */
export async function createSessionToken(userId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(getKey());
}

/** Devuelve el id del usuario si el token es auténtico y no expiró; si no, null. */
export async function verifySessionToken(token: string): Promise<number | null> {
  const key = getKey(); // fuera del try: si falta el secreto queremos un error ruidoso, no un null
  try {
    // "algorithms" fija el algoritmo permitido y evita ataques que cambian el de la cabecera
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null; // firma inválida, token manipulado o expirado
  }
}