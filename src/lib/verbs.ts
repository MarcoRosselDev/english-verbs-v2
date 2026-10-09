import { sql } from "@/lib/db";
import type { Verb, VerbInput, VerbListResponse } from "@/types/verb";

type ListOptions = { q: string; limit: number; offset: number };

/**
 * En LIKE/ILIKE los símbolos % y _ son comodines. Si el usuario busca "%" y no los
 * escapamos, devolvería TODO. Anteponemos "\" (el carácter de escape por defecto).
 * Ojo: esto es DISTINTO de la inyección SQL, de la que ya nos protegen los parámetros.
 */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, "\\$&");
}

export async function listVerbs({ q, limit, offset }: ListOptions): Promise<VerbListResponse> {
  // Sin término de búsqueda: lista simple ordenada alfabéticamente
  if (q === "") {
    const [rows, count] = await Promise.all([
      sql`SELECT * FROM verbs ORDER BY infinitive, id LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*)::int AS total FROM verbs`,
    ]);
    return { items: rows as Verb[], total: count[0].total, limit, offset };
  }

  // Con término: preparamos tres variantes del texto que usaremos como parámetros
  const escaped = escapeLike(q);
  const contains = `%${escaped}%`; // aparece en cualquier parte
  const prefix = `${escaped}%`;    // empieza con
  const exact = q.toLowerCase();   // coincidencia exacta

  const [rows, count] = await Promise.all([
    sql`
      SELECT * FROM verbs
      WHERE infinitive ILIKE ${contains}
         OR past_simple ILIKE ${contains}
         OR past_participle ILIKE ${contains}
         OR present_participle ILIKE ${contains}
         OR third_person_singular ILIKE ${contains}
         OR spanish_translation ILIKE ${contains}
      ORDER BY
        -- Relevancia: primero lo exacto, luego lo que empieza igual, luego el resto
        CASE
          WHEN lower(infinitive) = ${exact} THEN 0
          WHEN infinitive ILIKE ${prefix} THEN 1
          WHEN lower(spanish_translation) = ${exact} THEN 2
          WHEN spanish_translation ILIKE ${prefix} THEN 3
          ELSE 4
        END,
        infinitive
      LIMIT ${limit} OFFSET ${offset}`,
    sql`
      SELECT COUNT(*)::int AS total FROM verbs
      WHERE infinitive ILIKE ${contains}
         OR past_simple ILIKE ${contains}
         OR past_participle ILIKE ${contains}
         OR present_participle ILIKE ${contains}
         OR third_person_singular ILIKE ${contains}
         OR spanish_translation ILIKE ${contains}`,
  ]);

  return { items: rows as Verb[], total: count[0].total, limit, offset };
}

export async function getVerb(id: number): Promise<Verb | null> {
  const rows = await sql`SELECT * FROM verbs WHERE id = ${id}`;
  return (rows[0] as Verb | undefined) ?? null;
}

export async function createVerb(input: VerbInput, createdBy: number | null): Promise<Verb> {
  const rows = await sql`
    INSERT INTO verbs
      (infinitive, past_simple, past_participle, present_participle,
       third_person_singular, spanish_translation, is_regular, created_by)
    VALUES
      (${input.infinitive}, ${input.past_simple}, ${input.past_participle},
       ${input.present_participle}, ${input.third_person_singular},
       ${input.spanish_translation}, ${input.is_regular}, ${createdBy})
    RETURNING *`; // RETURNING devuelve la fila creada, con su id ya asignado
  return rows[0] as Verb;
}

export async function updateVerb(id: number, input: VerbInput): Promise<Verb | null> {
  const rows = await sql`
    UPDATE verbs SET
      infinitive = ${input.infinitive},
      past_simple = ${input.past_simple},
      past_participle = ${input.past_participle},
      present_participle = ${input.present_participle},
      third_person_singular = ${input.third_person_singular},
      spanish_translation = ${input.spanish_translation},
      is_regular = ${input.is_regular}
    WHERE id = ${id}
    RETURNING *`;
  return (rows[0] as Verb | undefined) ?? null; // null = no existía ese id
}

export async function deleteVerb(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM verbs WHERE id = ${id} RETURNING id`;
  return rows.length > 0; // false = no existía ese id
}