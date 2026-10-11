import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { MAX_VERBS_PER_USER } from "@/lib/constants";
import { countVerbsByCreator } from "@/lib/verbs";

export default async function AccountPage() {
  const user = await getCurrentUser();
  // Segunda barrera, la real: aunque proxy.ts fallara, aquí se vuelve a comprobar.
  if (!user) redirect("/login");

  const created = await countVerbsByCreator(user.id);
  const limit = user.role === "admin" ? "unlimited" : String(MAX_VERBS_PER_USER);

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="font-mono text-2xl tracking-tight">
          Account<span className="text-accent">_</span>
        </h1>

        <dl className="mt-8 divide-y divide-line rounded-lg border border-line bg-surface">
          {[
            ["Email", user.email],
            ["Role", user.role],
            ["Verbs created", `${created} / ${limit}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</dt>
              <dd className="font-mono text-sm">{value}</dd>
            </div>
          ))}
        </dl>

        <Link href="/" className="mt-6 inline-block font-mono text-xs text-muted transition-colors hover:text-ink">
          ← Back to verbs
        </Link>
      </main>
    </>
  );
}