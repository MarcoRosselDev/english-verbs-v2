"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, authApi } from "@/lib/api-client";
import { loginSchema, registerSchema } from "@/types/user";

type FieldErrors = { email?: string; password?: string };

const labelClass = "font-mono text-[11px] uppercase tracking-wider text-muted";
const inputClass =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-sm placeholder:text-muted/60 focus:border-accent";

/** Un solo formulario para login y registro: la única diferencia es el "mode". */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /** Ejecuta una acción de autenticación y, si sale bien, vuelve al inicio.
   *  router.refresh() hace que los componentes de servidor (Header, página) se vuelvan a
   *  renderizar y se enteren de que ya hay sesión. */
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setFormError(null);
    try {
      await action();
      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const next: FieldErrors = {};
        for (const issue of error.issues) {
          if (issue.field === "email" || issue.field === "password") next[issue.field] ??= issue.message;
        }
        setErrors(next);
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validamos con los mismos esquemas que usa el servidor
    const result = (isLogin ? loginSchema : registerSchema).safeParse({ email, password });
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password") next[field] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    void run(() => (isLogin ? authApi.login(result.data) : authApi.register(result.data)));
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-invalid={errors.password ? true : undefined}
            className={inputClass}
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
        </div>

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
        </button>
      </form>

      {isLogin && (
        <>
          <div className="my-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => authApi.demo())}
            className="w-full rounded-md border border-line px-4 py-2.5 text-sm transition-colors hover:border-muted disabled:opacity-50"
          >
            Try the demo account
          </button>
          <p className="mt-2 text-center text-xs text-muted">
            For recruiters: one click, no sign-up. You can add and edit your own verbs.
          </p>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "No account yet? " : "Already registered? "}
        <Link href={isLogin ? "/register" : "/login"} className="text-ink underline underline-offset-4">
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
  );
}