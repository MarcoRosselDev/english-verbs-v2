import { createUser } from "@/lib/users";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { isUniqueViolation, jsonError, readJson, serverError, validationError } from "@/lib/http";
import { registerSchema } from "@/types/user";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  const { email, password } = parsed.data;

  try {
    // El rol NUNCA se lee del cuerpo de la petición: todo registro nuevo es "user".
    // Si lo aceptáramos, cualquiera podría registrarse enviando {"role":"admin"}
    // (se llama "mass assignment" y es una vulnerabilidad clásica).
    const user = await createUser(email, await hashPassword(password));
    await setSessionCookie(user.id); // queda con la sesión iniciada
    return Response.json(user, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("That email is already registered", 409);
    return serverError(error);
  }
}