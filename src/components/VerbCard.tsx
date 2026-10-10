import type { Verb } from "@/types/verb";

type Props = {
  verb: Verb;
  onEdit: (verb: Verb) => void;
  onDelete: (verb: Verb) => void;
};

/** "as const" congela la lista: TypeScript sabe que `key` es EXACTAMENTE uno de estos
 *  cuatro textos (y no un string cualquiera). Por eso verb[key] queda bien tipado. */
const FORMS = [
  { key: "past_simple", label: "Past simple" },
  { key: "past_participle", label: "Past participle" },
  { key: "present_participle", label: "-ing form" },
  { key: "third_person_singular", label: "He / she / it" },
] as const;

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function VerbCard({ verb, onEdit, onDelete }: Props) {
  return (
    // "group" permite que los hijos reaccionen al hover/foco de la tarjeta completa
    <article className="group overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-muted/50">
      <header className="flex items-start justify-between gap-4 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <h3 className="truncate font-mono text-xl tracking-tight">
            <span className="text-sm text-muted">to </span>
            {verb.infinitive}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{verb.spanish_translation}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`mr-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              verb.is_regular ? "border-line text-muted" : "border-accent/40 text-accent"
            }`}
          >
            {verb.is_regular ? "regular" : "irregular"}
          </span>

          {/* En pantallas grandes los botones aparecen al pasar el cursor o al enfocar
              con teclado (group-focus-within). En móvil siempre están visibles. */}
          <div className="flex md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(verb)}
              aria-label={`Edit ${verb.infinitive}`}
              className="rounded p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <svg {...iconProps}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(verb)}
              aria-label={`Delete ${verb.infinitive}`}
              className="rounded p-1.5 text-muted transition-colors hover:bg-canvas hover:text-danger"
            >
              <svg {...iconProps}>
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Truco de las divisiones: el contenedor tiene fondo del color de la línea y un
          hueco de 1px (gap-px) entre celdas. Cada celda pinta su propio fondo, y el
          hueco deja ver la línea. Funciona igual en 2x2 (móvil) y 4x1 (escritorio). */}
      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
        {FORMS.map(({ key, label }) => (
          <div key={key} className="bg-surface px-4 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
            <dd className="mt-1 font-mono text-sm">{verb[key]}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}