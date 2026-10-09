import { ThemeToggle } from "./ThemeToggle";

// Componente de servidor (sin "use client"): se renderiza en el servidor, cero JS extra.
// Más adelante aquí irán el botón de login y el nombre del usuario.
export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <span className="font-mono text-sm font-medium tracking-tight">
          verbs<span className="text-accent">_</span>
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}