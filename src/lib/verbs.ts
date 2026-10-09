import { z } from "zod";

/**
 * 1) ESQUEMA DE VALIDACIÓN (zod)
 * Describe qué datos son válidos cuando el usuario crea o edita un verbo.
 * Se usará en el servidor (para rechazar datos malos) y en el formulario.
 */
export const verbInputSchema = z.object({
  infinitive: z.string().trim().min(1, "Requerido").max(50),
  past_simple: z.string().trim().min(1, "Requerido").max(50),
  past_participle: z.string().trim().min(1, "Requerido").max(50),
  present_participle: z.string().trim().min(1, "Requerido").max(50),
  third_person_singular: z.string().trim().min(1, "Requerido").max(50),
  spanish_translation: z.string().trim().min(1, "Requerido").max(100),
  is_regular: z.boolean(),
});

/**
 * 2) TIPO DERIVADO DEL ESQUEMA
 * z.infer saca el tipo de TypeScript desde el esquema de arriba.
 * Así hay UNA sola fuente de verdad: si cambias el esquema, el tipo se actualiza solo.
 */
export type VerbInput = z.infer<typeof verbInputSchema>;

/**
 * 3) TIPO DE UNA FILA DE LA BASE DE DATOS
 * Es lo que el usuario envía (VerbInput) más los campos que genera la base de datos.
 * Los nombres van en snake_case porque coinciden exactamente con las columnas SQL,
 * así no hace falta una capa de traducción entre la base de datos y el código.
 */
export type Verb = VerbInput & {
  id: number;
  created_by: number | null; // null si el usuario que lo creó fue eliminado
};