export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "theme";

/** Lee el tema guardado. Si no hay nada (o localStorage falla), usa "system". */
export function getStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // localStorage puede estar bloqueado (modo privado estricto, etc.)
  }
  return "system";
}

/** Pone o quita la clase "dark" en <html> según el tema elegido. */
export function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
}

/**
 * Misma lógica que applyTheme pero escrita como TEXTO en JavaScript plano.
 * Se inyecta en el <head> y se ejecuta antes de que React exista,
 * por eso no puede usar imports ni TypeScript.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;