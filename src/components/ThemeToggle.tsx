"use client"; // usa hooks y localStorage → solo puede ejecutarse en el navegador

import { useSyncExternalStore } from "react";
import { applyTheme, getStoredTheme, THEME_KEY, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "light" },
  { value: "dark", label: "dark" },
  { value: "system", label: "auto" },
];

/* ── Mini "store" externo ──
   El tema vive en localStorage, que NO es estado de React. Para que React se entere
   cuando cambia, usamos useSyncExternalStore: nos suscribimos a la fuente externa
   y React vuelve a renderizar cuando le avisamos. */
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  // Si el tema es "system" y el usuario cambia el modo de su sistema operativo,
  // lo reflejamos en vivo.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (getStoredTheme() === "system") applyTheme("system");
  };
  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(callback);
    media.removeEventListener("change", onSystemChange);
  };
}

function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // si falla el guardado, igual aplicamos el tema en esta sesión
  }
  applyTheme(theme);
  listeners.forEach((notify) => notify()); // avisa a React que cambió
}

export function ThemeToggle() {
  // 1er argumento: cómo suscribirse. 
  // 2do: cómo leer el valor en el navegador.
  // 3ro: qué valor usar en el servidor (donde no existe localStorage).
  //const theme = useSyncExternalStore(subscribe, getStoredTheme, () => "system" as Theme);
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    getStoredTheme,
    () => null,
  );

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex rounded-md border border-line p-0.5 font-mono text-xs"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
            className={`rounded px-2.5 py-1 transition-colors ${
              active ? "bg-ink text-canvas" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}