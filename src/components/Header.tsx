import Link from "next/link";
import type { PublicUser } from "@/types/user";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

// Sigue siendo componente de servidor: recibe el usuario ya resuelto desde la página.
export function Header({ user }: { user: PublicUser | null }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          verbs<span className="text-accent">_</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/account" className="font-mono text-xs text-muted transition-colors hover:text-ink">
                <span className="sm:hidden">account</span>
                <span className="hidden sm:inline">{user.email}</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted transition-colors hover:text-ink">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-line px-2.5 py-1 transition-colors hover:border-muted"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}