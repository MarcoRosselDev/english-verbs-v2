import { DEMO_EMAIL } from "@/lib/constants";
import { setSessionCookie } from "@/lib/auth";
import { jsonError, serverError } from "@/lib/http";
import { findUserByEmail } from "@/lib/users";

/** Inicia sesión como el usuario demo SIN contraseña. Es seguro porque esa cuenta es
 *  pública a propósito y tiene rol "user" (limitado). Nunca hagas esto con una cuenta admin. */
export async function POST() {
  try {
    const user = await findUserByEmail(DEMO_EMAIL);
    if (!user || user.role !== "user") return jsonError("Demo account is not available", 404);

    await setSessionCookie(user.id);
    return Response.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    return serverError(error);
  }
}