import { clearSessionCookie } from "@/lib/auth";

// Es POST y no GET a propósito: un GET podría dispararse desde otra web con una simple
// imagen <img src="...logout"> y cerrarte la sesión sin que lo notes.
export async function POST() {
  await clearSessionCookie();
  return new Response(null, { status: 204 });
}