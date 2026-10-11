import { describe, expect, it } from "vitest";
import { canModifyVerb } from "@/lib/permissions";
import type { PublicUser } from "@/types/user";

const admin: PublicUser = { id: 1, email: "admin@example.com", role: "admin" };
const ana: PublicUser = { id: 2, email: "ana@example.com", role: "user" };

describe("canModifyVerb", () => {
  it("deniega a los visitantes sin sesión", () => {
    expect(canModifyVerb(null, { created_by: 2 })).toBe(false);
  });

  it("permite a un usuario modificar SUS verbos", () => {
    expect(canModifyVerb(ana, { created_by: ana.id })).toBe(true);
  });

  it("deniega a un usuario modificar verbos de otra persona", () => {
    expect(canModifyVerb(ana, { created_by: 99 })).toBe(false);
  });

  it("deniega a un usuario modificar los verbos base (created_by = null)", () => {
    expect(canModifyVerb(ana, { created_by: null })).toBe(false);
  });

  it("permite al admin modificar cualquier verbo", () => {
    expect(canModifyVerb(admin, { created_by: null })).toBe(true);
    expect(canModifyVerb(admin, { created_by: 2 })).toBe(true);
  });
});