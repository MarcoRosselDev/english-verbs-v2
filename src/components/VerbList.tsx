import type { Verb } from "@/types/verb";
import { VerbCard } from "./VerbCard";

type Props = {
  items: Verb[] | null; // null = todavía no llegó la primera respuesta
  loading: boolean;
  error: string | null;
  query: string;
  onEdit: (verb: Verb) => void;
  onDelete: (verb: Verb) => void;
};

export function VerbList({ items, loading, error, query, onEdit, onDelete }: Props) {
  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-line bg-surface p-5">
        <p className="font-mono text-sm text-danger">Could not load verbs</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }

  // Primera carga: esqueletos con la forma de las tarjetas
  if (items === null) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-10 text-center">
        <p className="font-mono text-sm">No results{query && <> for “{query}”</>}</p>
        <p className="mt-1 text-sm text-muted">Try another form, or add the verb yourself.</p>
      </div>
    );
  }

  // Si ya hay datos y se está buscando otra cosa, mostramos los anteriores atenuados
  // en vez de vaciar la pantalla: evita el parpadeo entre búsquedas.
  return (
    <div
      className={`space-y-3 transition-opacity ${loading ? "opacity-60" : ""}`}
      aria-busy={loading}
    >
      {items.map((verb) => (
        <VerbCard key={verb.id} verb={verb} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}