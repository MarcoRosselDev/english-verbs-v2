import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session";

// Misma clave que usa la app durante los tests (definida en vitest.config.ts)
const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const otherKey = new TextEncoder().encode("otra-clave-distinta-otra-clave-distinta!!");

describe("tokens de sesión", () => {
  it("un token recién creado se verifica y devuelve el id del usuario", async () => {
    const token = await createSessionToken(42);
    expect(await verifySessionToken(token)).toBe(42);
  });

  it("rechaza texto que no es un token", async () => {
    expect(await verifySessionToken("no-soy-un-token")).toBeNull();
  });

  it("rechaza un token firmado con OTRA clave (falsificado)", async () => {
    const forged = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setExpirationTime("1h")
      .sign(otherKey);
    expect(await verifySessionToken(forged)).toBeNull();
  });

  it("rechaza un token expirado", async () => {
    const expired = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60) // venció hace un minuto
      .sign(key);
    expect(await verifySessionToken(expired)).toBeNull();
  });

  it("rechaza un token firmado con otro algoritmo (aunque use la clave correcta)", async () => {
    const wrongAlg = await new SignJWT({})
      .setProtectedHeader({ alg: "HS512" })
      .setSubject("1")
      .setExpirationTime("1h")
      .sign(key);
    expect(await verifySessionToken(wrongAlg)).toBeNull();
  });

  it("rechaza un token cuyo sujeto no es un id numérico", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("abc")
      .setExpirationTime("1h")
      .sign(key);
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("falla con ruido (no devuelve null) si AUTH_SECRET es demasiado corto", async () => {
    const original = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "corto";
    try {
      await expect(verifySessionToken("lo-que-sea")).rejects.toThrow();
    } finally {
      process.env.AUTH_SECRET = original;
    }
  });
});