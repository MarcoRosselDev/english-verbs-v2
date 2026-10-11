import { sql } from "@/lib/db";
import type { PublicUser, Role } from "@/types/user";

type UserWithHash = PublicUser & { 
  password_hash: string 
};

// Nunca usamos SELECT * con usuarios: elegimos las columnas a mano para no filtrar el hash.

export async function findUserByEmail(email: string): Promise<UserWithHash | null> {
  const rows = await sql`SELECT id, email, role, password_hash FROM users WHERE email = ${email}`;
  return (rows[0] as UserWithHash | undefined) ?? null;
}

export async function findUserById(id: number): Promise<PublicUser | null> {
  const rows = await sql`SELECT id, email, role FROM users WHERE id = ${id}`;
  return (rows[0] as PublicUser | undefined) ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: Role = "user",
): Promise<PublicUser> {
  const rows = await sql`
    INSERT INTO users (email, password_hash, role)
    VALUES (${email}, ${passwordHash}, ${role})
    RETURNING id, email, role`;
  return rows[0] as PublicUser;
}