import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

/**
 * Cliente SQL de Neon. Se usa como "tagged template":
 *
 *   const rows = await sql`SELECT * FROM verbs WHERE id = ${id}`;
 *
 * Los ${valores} NO se concatenan al texto: se envían como parámetros,
 * lo que previene inyección SQL por diseño.
 */
export const sql = neon(process.env.DATABASE_URL);