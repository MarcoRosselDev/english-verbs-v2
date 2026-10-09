import type { ZodError } from "zod";

/** Respuesta de error con formato uniforme: { error: "mensaje" } */
export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** 400: los datos enviados no cumplen el esquema. Indica qué campo falló y por qué. */
export function validationError(error: ZodError) {
  return Response.json(
    {
      error: "Validation failed",
      issues: error.issues.map((issue) => ({
        field: issue.path.map(String).join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );
}

/** 500: el detalle real va al log del SERVIDOR; al cliente solo un mensaje genérico.
 *  Mostrar el error de la base de datos al usuario filtraría información interna. */
export function serverError(error: unknown) {
  console.error(error);
  return jsonError("Internal server error", 500);
}

/** Postgres devuelve el código "23505" cuando se viola una restricción UNIQUE. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}

/** Convierte "42" en 42. Devuelve null si no es un entero positivo (ej: "abc", "-1", "4.5"). */
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Lee el cuerpo JSON. Si viene vacío o malformado devuelve undefined
 *  (y el esquema de zod lo rechazará con un 400 claro, en vez de romper). */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}