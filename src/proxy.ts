import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Primera barrera: si no hay sesión válida, /account redirige a /login antes de renderizar.
 * Es una comprobación "optimista": solo verifica la firma del token, no consulta la base
 * de datos. La barrera REAL está en cada página y en cada ruta de la API, que vuelven a
 * comprobar. En 2025 se descubrió una falla que permitía saltarse el middleware de Next.js
 * en ciertas versiones: por eso nunca se debe confiar solo en esta capa.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await verifySessionToken(token) : null;

  if (userId === null) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

// Solo se ejecuta en estas rutas (no en toda la app, para no gastar tiempo en vano)
export const config = {
  matcher: ["/account/:path*"],
};