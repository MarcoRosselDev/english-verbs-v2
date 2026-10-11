import { findUserByEmail } from "@/lib/users";
import { getDummyHash, setSessionCookie, verifyPassword } from "@/lib/auth";
import { jsonError, readJson, serverError, validationError } from "@/lib/http";
import { loginSchema } from "@/types/user";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  const { email, password } = parsed.data;

  try {
    const user = await findUserByEmail(email);

    // Siempre hacemos una comparación (real o contra el señuelo) para que el tiempo
    // de respuesta sea parecido exista o no el email.
    const ok = await verifyPassword(password, user?.password_hash ?? (await getDummyHash()));

    // Mismo mensaje para "email inexistente" y "contraseña incorrecta":
    // no le damos pistas a quien intenta adivinar cuentas.
    if (!user || !ok) return jsonError("Invalid email or password", 401);

    await setSessionCookie(user.id);
    return Response.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    return serverError(error);
  }
}