"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { verbInputSchema, type Verb, type VerbInput } from "@/types/verb";

/** Exclude quita "is_regular" de la unión de nombres: quedan solo los campos de texto. */
type TextField = Exclude<keyof VerbInput, "is_regular">;

const FIELDS: { name: TextField; label: string; placeholder: string }[] = [
  { name: "infinitive", label: "Infinitive", placeholder: "swim" },
  { name: "spanish_translation", label: "Spanish translation", placeholder: "nadar" },
  { name: "past_simple", label: "Past simple", placeholder: "swam" },
  { name: "past_participle", label: "Past participle", placeholder: "swum" },
  { name: "present_participle", label: "-ing form", placeholder: "swimming" },
  { name: "third_person_singular", label: "He / she / it", placeholder: "swims" },
];

const EMPTY: VerbInput = {
  infinitive: "",
  past_simple: "",
  past_participle: "",
  present_participle: "",
  third_person_singular: "",
  spanish_translation: "",
  is_regular: false,
};

/** Un Verb trae id y created_by; el formulario solo edita los campos de VerbInput. */
function toInput(verb: Verb): VerbInput {
  return {
    infinitive: verb.infinitive,
    past_simple: verb.past_simple,
    past_participle: verb.past_participle,
    present_participle: verb.present_participle,
    third_person_singular: verb.third_person_singular,
    spanish_translation: verb.spanish_translation,
    is_regular: verb.is_regular,
  };
}

type Props = {
  verb: Verb | null; // null = crear uno nuevo; con valor = editar
  onSubmit: (input: VerbInput) => Promise<void>;
  onCancel: () => void;
};

export function VerbForm({ verb, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<VerbInput>(verb ? toInput(verb) : EMPTY);
  // Partial<Record<...>> = "un objeto que puede tener un mensaje de error por campo, o no"
  const [errors, setErrors] = useState<Partial<Record<keyof VerbInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Validación en el navegador con el MISMO esquema que usa el servidor
    const result = verbInputSchema.safeParse(values);
    if (!result.success) {
      const next: Partial<Record<keyof VerbInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof VerbInput;
        next[field] ??= issue.message; // conserva solo el primer mensaje de cada campo
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await onSubmit(result.data); // result.data ya viene limpio (sin espacios sobrantes)
    } catch (error) {
      if (error instanceof ApiError) {
        // El servidor también puede rechazar (ej: 409 duplicado)
        const next: Partial<Record<keyof VerbInput, string>> = {};
        for (const issue of error.issues) {
          if (issue.field in EMPTY) next[issue.field as keyof VerbInput] = issue.message;
        }
        setErrors(next);
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 font-mono text-sm placeholder:text-muted/60 focus:border-accent";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ name, label, placeholder }) => (
          <div key={name}>
            <label htmlFor={name} className="font-mono text-[11px] uppercase tracking-wider text-muted">
              {label}
            </label>
            <input
              id={name}
              value={values[name]}
              placeholder={placeholder}
              autoComplete="off"
              aria-invalid={errors[name] ? true : undefined}
              onChange={(event) => setValues((v) => ({ ...v, [name]: event.target.value }))}
              className={inputClass}
            />
            {errors[name] && <p className="mt-1 text-xs text-danger">{errors[name]}</p>}
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.is_regular}
          onChange={(event) => setValues((v) => ({ ...v, is_regular: event.target.checked }))}
          className="size-4 accent-[var(--accent)]"
        />
        Regular verb (adds -ed)
      </label>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : verb ? "Save changes" : "Create verb"}
        </button>
      </div>
    </form>
  );
}