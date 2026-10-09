import { sql } from "@/lib/db";

// Ruta TEMPORAL para comprobar que la conexión a la base de datos funciona.
// La borraremos o protegeremos más adelante.
export async function GET() {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM verbs`;
    return Response.json({ ok: true, verbs: rows[0].total });
  } catch (error) {
    console.error("Error de conexión a la base de datos:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}