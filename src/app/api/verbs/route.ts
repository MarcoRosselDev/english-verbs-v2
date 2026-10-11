import { z } from "zod";
import {countVerbsByCreator, createVerb, listVerbs } from "@/lib/verbs";
import { isUniqueViolation, jsonError, readJson, serverError, validationError } from "@/lib/http";
import { verbInputSchema } from "@/types/verb";
import { getCurrentUser } from "@/lib/auth";
import { MAX_VERBS_PER_USER } from "@/lib/constants";

/** Parámetros permitidos en la URL: /api/verbs?q=run&limit=20&offset=0
 *  Los de la URL siempre llegan como texto, por eso "coerce" los convierte a número.
 *  El límite máximo evita que alguien pida 1.000.000 de filas de golpe. */
const listQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return validationError(parsed.error);

  try {
    return Response.json(await listVerbs(parsed.data));
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    // 401 = "no sé quién eres" (falta iniciar sesión)
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required", 401);

    const parsed = verbInputSchema.safeParse(await readJson(request));
    if (!parsed.success) return validationError(parsed.error);

    // Tope para usuarios normales (y para la cuenta demo compartida)
    if (user.role !== "admin" && (await countVerbsByCreator(user.id)) >= MAX_VERBS_PER_USER) {
      return jsonError(`You can create up to ${MAX_VERBS_PER_USER} verbs`, 403);
    }

    const verb = await createVerb(parsed.data, user.id); // ← ahora queda registrado quién lo creó
    return Response.json(verb, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("That verb already exists", 409);
    return serverError(error);
  }
}
/* export async function POST(request: Request) {
  // TODO (parte 5): exigir sesión iniciada. Por ahora CUALQUIERA puede crear.

  const parsed = verbInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const verb = await createVerb(parsed.data, null); // null = sin usuario todavía
    return Response.json(verb, { status: 201 }); // 201 = Created
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("That verb already exists", 409); // 409 = Conflict
    return serverError(error);
  }
} */