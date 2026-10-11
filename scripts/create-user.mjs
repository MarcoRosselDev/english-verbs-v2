// Uso: node --env-file=.env.local scripts/create-user.mjs <email> <password> [admin|user]
// Si el email ya existe, actualiza su contraseña y rol (sirve para resetear).
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const [email, password, role = "user"] = process.argv.slice(2);

if (!email || !password) {
  console.error("Uso: node --env-file=.env.local scripts/create-user.mjs <email> <password> [admin|user]");
  process.exit(1);
}
if (!["admin", "user"].includes(role)) {
  console.error('El rol debe ser "admin" o "user"');
  process.exit(1);
}
if (password.length < 8 || password.length > 72) {
  console.error("La contraseña debe tener entre 8 y 72 caracteres");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const hash = await bcrypt.hash(password, 12);

const rows = await sql`
  INSERT INTO users (email, password_hash, role)
  VALUES (${email.trim().toLowerCase()}, ${hash}, ${role})
  ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
  RETURNING id, email, role`;

console.log("Listo:", rows[0]);