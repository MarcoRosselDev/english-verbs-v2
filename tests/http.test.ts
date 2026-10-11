import { describe, expect, it, vi } from "vitest";
import {
  isUniqueViolation, jsonError, parseId, readJson, serverError, validationError,
} from "@/lib/http";
import { verbInputSchema } from "@/types/verb";

describe("parseId", () => {
  it("acepta enteros positivos", () => expect(parseId("42")).toBe(42));

  it.each(["abc", "-1", "0", "4.5", "", "1e3x"])("rechaza %j", (raw) => {
    expect(parseId(raw)).toBeNull();
  });
});

describe("isUniqueViolation", () => {
  it("reconoce el código 23505 de Postgres", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  it("ignora otros errores", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(new Error("boom"))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
  });
});

describe("jsonError", () => {
  it("devuelve { error } con el estado indicado", async () => {
    const response = jsonError("Nope", 418);
    expect(response.status).toBe(418);
    expect(await response.json()).toEqual({ error: "Nope" });
  });
});

describe("validationError", () => {
  it("responde 400 indicando qué campo falló", async () => {
    const parsed = verbInputSchema.safeParse({});
    if (parsed.success) throw new Error("se esperaba que la validación fallara");

    const response = validationError(parsed.error);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.issues.map((issue: { field: string }) => issue.field)).toContain("infinitive");
  });
});

describe("serverError", () => {
  it("responde 500 SIN filtrar el detalle del error al cliente", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {}); // silencia el log del test
    const response = serverError(new Error("password=hunter2 en la base"));
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).not.toContain("hunter2");
    spy.mockRestore();
  });
});

describe("readJson", () => {
  it("lee un cuerpo JSON válido", async () => {
    const request = new Request("http://localhost", { method: "POST", body: '{"a":1}' });
    expect(await readJson(request)).toEqual({ a: 1 });
  });

  it("devuelve undefined si el cuerpo está malformado (no lanza error)", async () => {
    const request = new Request("http://localhost", { method: "POST", body: "esto no es json" });
    expect(await readJson(request)).toBeUndefined();
  });
});