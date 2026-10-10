import { useEffect, useState } from "react";

/** Devuelve `value`, pero solo después de que dejó de cambiar durante `delay` ms.
 *  Así no hacemos una petición por cada tecla que el usuario escribe. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // si llega otro valor antes, se cancela el timer anterior
  }, [value, delay]);

  return debounced;
}