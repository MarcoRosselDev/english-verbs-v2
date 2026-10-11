import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <>
      <Header user={null} />
      <main className="mx-auto w-full max-w-sm px-6 py-16">
        <h1 className="font-mono text-xl tracking-tight">
          Create account<span className="text-accent">_</span>
        </h1>
        <p className="mt-2 text-sm text-muted">At least 8 characters. We store only a hash, never your password.</p>
        <AuthForm mode="register" />
      </main>
    </>
  );
}