"use client";

import { useState } from "react";
import type { Verb } from "@/types/verb";

type Props = {
  verb: Verb;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function DeleteConfirm({ verb, onConfirm, onCancel }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">
        <span className="font-mono text-ink">{verb.infinitive}</span> will be permanently deleted.
        This can’t be undone.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}