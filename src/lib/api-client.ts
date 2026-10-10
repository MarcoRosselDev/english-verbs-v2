import type { Verb, VerbInput, VerbListResponse } from "@/types/verb";

type Issue = { field: string; message: string };

/** Error con el código HTTP y los detalles de validación que envía nuestra API. */
export class ApiError extends Error {
  status: number;
  issues: Issue[];

  constructor(message: string, status: number, issues: Issue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

/** <T> es un "genérico": quien llama dice qué tipo de dato espera recibir,
 *  y la función lo devuelve ya tipado. Así evitamos repetir el fetch en cada llamada. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (response.status === 204) return undefined as T; // DELETE no devuelve cuerpo

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(body?.error ?? "Request failed", response.status, body?.issues ?? []);
  }
  return body as T;
}

export const verbsApi = {
  list(params: { q: string; limit: number; offset: number }, signal?: AbortSignal) {
    const search = new URLSearchParams({
      q: params.q,
      limit: String(params.limit),
      offset: String(params.offset),
    });
    return request<VerbListResponse>(`/api/verbs?${search}`, { signal });
  },
  create: (input: VerbInput) =>
    request<Verb>("/api/verbs", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: VerbInput) =>
    request<Verb>(`/api/verbs/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/api/verbs/${id}`, { method: "DELETE" }),
};