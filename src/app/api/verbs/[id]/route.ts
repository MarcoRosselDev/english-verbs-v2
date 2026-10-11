import { deleteVerb, getVerb, updateVerb } from "@/lib/verbs";
import {
  isUniqueViolation, jsonError, parseId, readJson, serverError, validationError,
} from "@/lib/http";
import { verbInputSchema } from "@/types/verb";
import { getCurrentUser } from "@/lib/auth";
import { canModifyVerb } from "@/lib/permissions";

// En Next.js 16, "params" es una Promise: hay que usar await para leerlo.
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("Invalid id", 400);

  try {
    const verb = await getVerb(id);
    return verb ? Response.json(verb) : jsonError("Verb not found", 404);
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required", 401);

    const id = parseId((await params).id);
    if (id === null) return jsonError("Invalid id", 400);

    const existing = await getVerb(id);
    if (!existing) return jsonError("Verb not found", 404);

    // 403 = "sé quién eres, pero no tienes permiso"
    if (!canModifyVerb(user, existing)) {
      return jsonError("You can only modify verbs you created", 403);
    }

    const parsed = verbInputSchema.safeParse(await readJson(request));
    if (!parsed.success) return validationError(parsed.error);

    const verb = await updateVerb(id, parsed.data);
    return verb ? Response.json(verb) : jsonError("Verb not found", 404);
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("That verb already exists", 409);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required", 401);

    const id = parseId((await params).id);
    if (id === null) return jsonError("Invalid id", 400);

    const existing = await getVerb(id);
    if (!existing) return jsonError("Verb not found", 404);
    if (!canModifyVerb(user, existing)) {
      return jsonError("You can only delete verbs you created", 403);
    }

    await deleteVerb(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}

/* export async function PUT(request: Request, { params }: Context) {
  // TODO (parte 5): exigir sesión y rol "admin"
  const id = parseId((await params).id);
  if (id === null) return jsonError("Invalid id", 400);

  const parsed = verbInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const verb = await updateVerb(id, parsed.data);
    return verb ? Response.json(verb) : jsonError("Verb not found", 404);
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("That verb already exists", 409);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  // TODO (parte 5): exigir sesión y rol "admin"
  const id = parseId((await params).id);
  if (id === null) return jsonError("Invalid id", 400);

  try {
    const deleted = await deleteVerb(id);
    return deleted ? new Response(null, { status: 204 }) : jsonError("Verb not found", 404); // 204 = sin contenido
  } catch (error) {
    return serverError(error);
  }
} */