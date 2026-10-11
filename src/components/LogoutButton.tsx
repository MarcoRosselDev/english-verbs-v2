"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await authApi.logout();
    } finally {
      router.push("/");
      router.refresh(); // vuelve a renderizar los componentes de servidor sin sesión
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="text-muted transition-colors hover:text-ink disabled:opacity-50"
    >
      Log out
    </button>
  );
}