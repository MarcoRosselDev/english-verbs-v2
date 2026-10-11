import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/"); // si ya hay sesión, no tiene sentido ver el login

  return (
    <>
      <Header user={null} />
      <main className="mx-auto w-full max-w-sm px-6 py-16">
        <h1 className="font-mono text-xl tracking-tight">
          Log in<span className="text-accent">_</span>
        </h1>
        <AuthForm mode="login" />
      </main>
    </>
  );
}