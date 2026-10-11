import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Enseña a Vitest que "@/lib/db" significa "src/lib/db" (igual que en tsconfig.json)
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Secreto falso, solo para tests: session.ts exige al menos 32 caracteres
    env: { AUTH_SECRET: "test-secret-test-secret-test-secret-123" },
  },
});