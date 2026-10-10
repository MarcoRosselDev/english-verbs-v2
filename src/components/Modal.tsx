"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

/** Usa el elemento nativo <dialog>: el navegador ya se encarga de atrapar el foco
 *  dentro, cerrar con Esc y oscurecer el fondo. Menos código y más accesible. */
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // React maneja "open" como estado, pero <dialog> se abre con un método imperativo.
  // Este efecto sincroniza ambos mundos.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose} // se dispara con Esc o con dialog.close()
      onClick={(event) => {
        // Clic en el fondo oscuro: el objetivo es el <dialog> mismo, no su contenido
        if (event.target === ref.current) onClose();
      }}
      // m-auto: el reset de Tailwind quita el centrado por defecto del <dialog>
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-black/60"
    >
      {/* Renderizar los hijos solo si está abierto reinicia el formulario cada vez */}
      {open && (
        <div className="p-5">
          <h2 id={titleId} className="mb-4 font-mono text-base">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}