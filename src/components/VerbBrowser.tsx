"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { verbsApi } from "@/lib/api-client";
import type { Verb, VerbInput, VerbListResponse } from "@/types/verb";
import { DeleteConfirm } from "./DeleteConfirm";
import { Modal } from "./Modal";
import { SearchBar } from "./SearchBar";
import { VerbForm } from "./VerbForm";
import { VerbList } from "./VerbList";

const LIMIT = 10;

/** Resultado de una petición, etiquetado con la "clave" que lo originó (ver abajo). */
type Result = { key: string; data: VerbListResponse | null; error: string | null };

/** Unión discriminada: el campo "type" dice qué forma tiene el resto.
 *  TypeScript sabe que si type === "delete", entonces verb NO es null. */
type DialogState =
  | { type: "form"; verb: Verb | null } // verb null = crear
  | { type: "delete"; verb: Verb }
  | null; // null = ningún diálogo abierto

function dialogTitle(dialog: DialogState): string {
  if (dialog?.type === "delete") return "Delete verb";
  if (dialog?.type === "form" && dialog.verb) return "Edit verb";
  return "New verb";
}

export function VerbBrowser() {
  const [input, setInput] = useState("");
  const [offset, setOffset] = useState(0);
  const [version, setVersion] = useState(0); // sube +1 tras crear/editar/borrar para recargar
  const [result, setResult] = useState<Result | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const query = useDebounce(input.trim(), 300);

  /* ── Cómo evitamos un "loading" manual ──
     Cada petición se identifica con una clave (qué buscamos + página + versión).
     Guardamos la respuesta junto con SU clave. Si la clave guardada no coincide con la
     actual, sabemos que estamos cargando, sin necesitar un estado "loading" que haya
     que encender y apagar a mano (fuente típica de bugs). */
  const key = `${query}|${offset}|${version}`;

  useEffect(() => {
    // AbortController cancela la petición anterior si el usuario sigue escribiendo.
    // Sin esto, una respuesta lenta vieja podría llegar DESPUÉS de la nueva y pisarla.
    const controller = new AbortController();

    verbsApi
      .list({ q: query, limit: LIMIT, offset }, controller.signal)
      .then((data) => setResult({ key, data, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return; // cancelada a propósito: no es un error
        setResult((prev) => ({
          key,
          data: prev?.data ?? null,
          error: error instanceof Error ? error.message : "Unexpected error",
        }));
      });

    return () => controller.abort(); // limpieza al cambiar de búsqueda o desmontar
  }, [key, query, offset]);

  const loading = result === null || result.key !== key;
  const data = result?.data ?? null;
  const error = result !== null && result.key === key ? result.error : null;

  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + LIMIT, total);

  function handleSearch(value: string) {
    setInput(value);
    setOffset(0); // nueva búsqueda → volver a la primera página
  }

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  }

  async function handleSave(values: VerbInput) {
    if (dialog?.type !== "form") return;
    const isEdit = dialog.verb !== null;
    if (dialog.verb) await verbsApi.update(dialog.verb.id, values);
    else await verbsApi.create(values);
    // Si falla, la excepción sube al formulario, que muestra el error sin cerrar el modal
    setDialog(null);
    setVersion((v) => v + 1);
    flash(isEdit ? "Verb updated" : "Verb created");
  }

  async function handleDelete() {
    if (dialog?.type !== "delete") return;
    await verbsApi.remove(dialog.verb.id);
    setDialog(null);
    // Si borramos el último de una página que no es la primera, retrocedemos una página
    if (data && data.items.length === 1 && offset > 0) setOffset(offset - LIMIT);
    setVersion((v) => v + 1);
    flash("Verb deleted");
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={input} onChange={handleSearch} />
        <button
          type="button"
          onClick={() => setDialog({ type: "form", verb: null })}
          className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          + New verb
        </button>
      </div>

      <p className="mb-3 mt-5 font-mono text-xs text-muted">
        {data ? `${from}–${to} of ${total} verbs` : "\u00a0"}
      </p>

      <VerbList
        items={data?.items ?? null}
        loading={loading}
        error={error}
        query={query}
        onEdit={(verb) => setDialog({ type: "form", verb })}
        onDelete={(verb) => setDialog({ type: "delete", verb })}
      />

      {total > LIMIT && (
        <nav className="mt-6 flex items-center justify-between font-mono text-xs" aria-label="Pagination">
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            className="rounded-md border border-line px-3 py-1.5 transition-colors hover:border-muted disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-muted">
            page {Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}
          </span>
          <button
            type="button"
            disabled={offset + LIMIT >= total}
            onClick={() => setOffset(offset + LIMIT)}
            className="rounded-md border border-line px-3 py-1.5 transition-colors hover:border-muted disabled:opacity-40"
          >
            Next →
          </button>
        </nav>
      )}

      <Modal open={dialog !== null} onClose={() => setDialog(null)} title={dialogTitle(dialog)}>
        {dialog?.type === "form" && (
          <VerbForm
            key={dialog.verb?.id ?? "new"}
            verb={dialog.verb}
            onSubmit={handleSave}
            onCancel={() => setDialog(null)}
          />
        )}
        {dialog?.type === "delete" && (
          <DeleteConfirm verb={dialog.verb} onConfirm={handleDelete} onCancel={() => setDialog(null)} />
        )}
      </Modal>

      {/* aria-live: los lectores de pantalla anuncian el mensaje cuando aparece */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 right-4">
        {notice && (
          <span className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs shadow-lg">
            {notice}
          </span>
        )}
      </div>
    </section>
  );
}