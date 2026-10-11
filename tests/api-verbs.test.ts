import { beforeEach, describe, expect, it, vi } from "vitest";

/* ── MOCKS ──
   vi.mock reemplaza un módulo completo por versiones falsas que nosotros controlamos.
   Vitest mueve estas líneas al principio del archivo, antes de los imports. Así, cuando
   las rutas importan "@/lib/auth" y "@/lib/verbs", reciben los falsos y NUNCA se carga
   la conexión real a la base de datos. */
vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/verbs", () => ({
  listVerbs: vi.fn(),
  getVerb: vi.fn(),
  createVerb: vi.fn(),
  updateVerb: vi.fn(),
  deleteVerb: vi.fn(),
  countVerbsByCreator: vi.fn(),
}));

import { DELETE, PUT } from "@/app/api/verbs/[id]/route";
import { GET, POST } from "@/app/api/verbs/route";
import { getCurrentUser } from "@/lib/auth";
import { MAX_VERBS_PER_USER } from "@/lib/constants";
import * as verbs from "@/lib/verbs";
import type { PublicUser } from "@/types/user";
import type { Verb, VerbInput } from "@/types/verb";

const admin: PublicUser = { id: 1, email: "admin@example.com", role: "admin" };
const ana: PublicUser = { id: 2, email: "ana@example.com", role: "user" };

const validVerb: VerbInput = {
  infinitive: "swim",
  past_simple: "swam",
  past_participle: "swum",
  present_participle: "swimming",
  third_person_singular: "swims",
  spanish_translation: "nadar",
  is_regular: false,
};

/** Un verbo "guardado" en la base falsa; created_by dice de quién es. */
const storedVerb = (created_by: number | null): Verb => ({ id: 7, ...validVerb, created_by });

/** Simula quién tiene la sesión iniciada en este test. */
const loginAs = (user: PublicUser | null) => vi.mocked(getCurrentUser).mockResolvedValue(user);

const jsonRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/verbs", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

/** En Next.js 16 "params" es una Promise; así lo recibe la ruta real. */
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// Antes de CADA test se borra todo lo simulado, para que un test no contamine al siguiente
beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/verbs", () => {
  it("es público y pasa los parámetros validados a la consulta", async () => {
    vi.mocked(verbs.listVerbs).mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

    const response = await GET(new Request("http://localhost/api/verbs?q=run"));

    expect(response.status).toBe(200);
    // Los valores por defecto (limit 20, offset 0) los pone el esquema
    expect(verbs.listVerbs).toHaveBeenCalledWith({ q: "run", limit: 20, offset: 0 });
  });

  it("rechaza un limit fuera de rango con 400", async () => {
    const response = await GET(new Request("http://localhost/api/verbs?limit=999"));
    expect(response.status).toBe(400);
    expect(verbs.listVerbs).not.toHaveBeenCalled();
  });
});

describe("POST /api/verbs", () => {
  it("401 si no hay sesión, y no toca la base", async () => {
    loginAs(null);
    const response = await POST(jsonRequest("POST", validVerb));
    expect(response.status).toBe(401);
    expect(verbs.createVerb).not.toHaveBeenCalled();
  });

  it("400 si los datos no son válidos", async () => {
    loginAs(ana);
    const response = await POST(jsonRequest("POST", { ...validVerb, infinitive: "" }));
    expect(response.status).toBe(400);
    expect(verbs.createVerb).not.toHaveBeenCalled();
  });

  it("201 y registra QUIÉN creó el verbo", async () => {
    loginAs(ana);
    vi.mocked(verbs.countVerbsByCreator).mockResolvedValue(0);
    vi.mocked(verbs.createVerb).mockResolvedValue(storedVerb(ana.id));

    const response = await POST(jsonRequest("POST", validVerb));

    expect(response.status).toBe(201);
    expect(verbs.createVerb).toHaveBeenCalledWith(validVerb, ana.id);
  });

  it("403 si el usuario ya alcanzó su tope de verbos", async () => {
    loginAs(ana);
    vi.mocked(verbs.countVerbsByCreator).mockResolvedValue(MAX_VERBS_PER_USER);

    const response = await POST(jsonRequest("POST", validVerb));

    expect(response.status).toBe(403);
    expect(verbs.createVerb).not.toHaveBeenCalled();
  });

  it("el admin no tiene tope (ni siquiera se consulta el conteo)", async () => {
    loginAs(admin);
    vi.mocked(verbs.createVerb).mockResolvedValue(storedVerb(admin.id));

    const response = await POST(jsonRequest("POST", validVerb));

    expect(response.status).toBe(201);
    expect(verbs.countVerbsByCreator).not.toHaveBeenCalled();
  });

  it("409 si el verbo ya existe (violación UNIQUE de Postgres)", async () => {
    loginAs(ana);
    vi.mocked(verbs.countVerbsByCreator).mockResolvedValue(0);
    vi.mocked(verbs.createVerb).mockRejectedValue({ code: "23505" });

    const response = await POST(jsonRequest("POST", validVerb));
    expect(response.status).toBe(409);
  });

  it("500 genérico si la base falla (sin filtrar el detalle)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    loginAs(ana);
    vi.mocked(verbs.countVerbsByCreator).mockResolvedValue(0);
    vi.mocked(verbs.createVerb).mockRejectedValue(new Error("detalle interno secreto"));

    const response = await POST(jsonRequest("POST", validVerb));

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secreto");
    spy.mockRestore();
  });
});

describe("PUT /api/verbs/[id]", () => {
  it("401 sin sesión", async () => {
    loginAs(null);
    const response = await PUT(jsonRequest("PUT", validVerb), ctx("7"));
    expect(response.status).toBe(401);
  });

  it("400 si el id no es un número", async () => {
    loginAs(ana);
    const response = await PUT(jsonRequest("PUT", validVerb), ctx("abc"));
    expect(response.status).toBe(400);
  });

  it("404 si el verbo no existe", async () => {
    loginAs(ana);
    vi.mocked(verbs.getVerb).mockResolvedValue(null);
    const response = await PUT(jsonRequest("PUT", validVerb), ctx("7"));
    expect(response.status).toBe(404);
  });

  it("403 si un usuario intenta editar un verbo BASE", async () => {
    loginAs(ana);
    vi.mocked(verbs.getVerb).mockResolvedValue(storedVerb(null));

    const response = await PUT(jsonRequest("PUT", validVerb), ctx("7"));

    expect(response.status).toBe(403);
    expect(verbs.updateVerb).not.toHaveBeenCalled();
  });

  it("403 si un usuario intenta editar el verbo de OTRA persona", async () => {
    loginAs(ana);
    vi.mocked(verbs.getVerb).mockResolvedValue(storedVerb(99));

    const response = await PUT(jsonRequest("PUT", validVerb), ctx("7"));

    expect(response.status).toBe(403);
    expect(verbs.updateVerb).not.toHaveBeenCalled();
  });

  it("200 si edita un verbo PROPIO", async () => {
    loginAs(ana);
    vi.mocked(verbs.getVerb).mockResolvedValue(storedVerb(ana.id));
    vi.mocked(verbs.updateVerb).mockResolvedValue(storedVerb(ana.id));

    const response = await PUT(jsonRequest("PUT", validVerb), ctx("7"));

    expect(response.status).toBe(200);
    expect(verbs.updateVerb).toHaveBeenCalledWith(7, validVerb);
  });

  it("200 si el admin edita un verbo base", async () => {
    loginAs(admin);
    vi.mocked(verbs.getVerb).mockResolvedValue(storedVerb(null));
    vi.mocked(verbs.updateVerb).mockResolvedValue(storedVerb(null));

    const response = await PUT(jsonRequest("PUT", validVerb), ctx("7"));
    expect(response.status).toBe(200);
  });
});

describe("DELETE /api/verbs/[id]", () => {
  it("401 sin sesión", async () => {
    loginAs(null);
    const response = await DELETE(jsonRequest("DELETE"), ctx("7"));
    expect(response.status).toBe(401);
    expect(verbs.deleteVerb).not.toHaveBeenCalled();
  });

  it("404 si el verbo no existe", async () => {
    loginAs(ana);
    vi.mocked(verbs.getVerb).mockResolvedValue(null);
    const response = await DELETE(jsonRequest("DELETE"), ctx("7"));
    expect(response.status).toBe(404);
  });

  it("403 si intenta borrar un verbo ajeno", async () => {
    loginAs(ana);
    vi.mocked(verbs.getVerb).mockResolvedValue(storedVerb(99));

    const response = await DELETE(jsonRequest("DELETE"), ctx("7"));

    expect(response.status).toBe(403);
    expect(verbs.deleteVerb).not.toHaveBeenCalled();
  });

  it("204 si borra un verbo propio", async () => {
    loginAs(ana);
    vi.mocked(verbs.getVerb).mockResolvedValue(storedVerb(ana.id));
    vi.mocked(verbs.deleteVerb).mockResolvedValue(true);

    const response = await DELETE(jsonRequest("DELETE"), ctx("7"));

    expect(response.status).toBe(204);
    expect(verbs.deleteVerb).toHaveBeenCalledWith(7);
  });

  it("204 si el admin borra un verbo base", async () => {
    loginAs(admin);
    vi.mocked(verbs.getVerb).mockResolvedValue(storedVerb(null));
    vi.mocked(verbs.deleteVerb).mockResolvedValue(true);

    const response = await DELETE(jsonRequest("DELETE"), ctx("7"));
    expect(response.status).toBe(204);
  });
});