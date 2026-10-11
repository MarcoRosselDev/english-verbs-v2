import { z } from "zod";

export type Role = "admin" | "user";

/** Lo único que el resto de la app puede saber de un usuario.
 *  Fíjate que NO incluye password_hash: nunca debe salir de la capa de base de datos. */
export type PublicUser = { id: number; email: string; role: Role };

const emailSchema = z
  .string()
  .trim()
  .toLowerCase() // "Ana@Mail.com" y "ana@mail.com" son la misma cuenta
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email");

export const registerSchema = z.object({
  email: emailSchema,
  // bcrypt solo usa los primeros 72 bytes: más allá, la contraseña se ignoraría en silencio
  password: z.string().min(8, "At least 8 characters").max(72, "At most 72 characters"),
});

// En el login no exigimos el mínimo de 8: solo que no venga vacío
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Required").max(72),
});

export type Credentials = z.infer<typeof registerSchema>;