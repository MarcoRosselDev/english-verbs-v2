import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/types/user";
import { verbInputSchema, type VerbInput } from "@/types/verb";

const validVerb: VerbInput = {
  infinitive: "swim",
  past_simple: "swam",
  past_participle: "swum",
  present_participle: "swimming",
  third_person_singular: "swims",
  spanish_translation: "nadar",
  is_regular: false,
};

describe("verbInputSchema", () => {
  it("acepta un verbo válido", () => {
    expect(verbInputSchema.safeParse(validVerb).success).toBe(true);
  });

  it("elimina los espacios sobrantes", () => {
    const result = verbInputSchema.safeParse({ ...validVerb, infinitive: "  swim  " });
    expect(result.success && result.data.infinitive).toBe("swim");
  });

  // it.each repite el mismo test para cada campo de la lista
  it.each([
    "infinitive",
    "past_simple",
    "past_participle",
    "present_participle",
    "third_person_singular",
    "spanish_translation",
  ] as const)("rechaza el campo %s vacío (o solo espacios)", (field) => {
    const result = verbInputSchema.safeParse({ ...validVerb, [field]: "   " });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual([field]);
  });

  it("rechaza textos demasiado largos", () => {
    const result = verbInputSchema.safeParse({ ...validVerb, infinitive: "a".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("rechaza is_regular si no es booleano", () => {
    expect(verbInputSchema.safeParse({ ...validVerb, is_regular: "true" }).success).toBe(false);
  });

  it("rechaza un objeto vacío", () => {
    expect(verbInputSchema.safeParse({}).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("normaliza el email (espacios y mayúsculas)", () => {
    const result = registerSchema.safeParse({ email: "  Ana@Mail.COM ", password: "12345678" });
    expect(result.success && result.data.email).toBe("ana@mail.com");
  });

  it("exige al menos 8 caracteres en la contraseña", () => {
    expect(registerSchema.safeParse({ email: "a@b.com", password: "1234567" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.com", password: "12345678" }).success).toBe(true);
  });

  it("rechaza contraseñas de más de 72 caracteres (límite de bcrypt)", () => {
    expect(registerSchema.safeParse({ email: "a@b.com", password: "a".repeat(73) }).success).toBe(false);
  });

  it.each(["", "sin-arroba", "a@b", "a b@c.com"])("rechaza el email inválido %j", (email) => {
    expect(registerSchema.safeParse({ email, password: "12345678" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("NO exige largo mínimo (cuentas antiguas pueden tener otras reglas)", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rechaza contraseña vacía", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});