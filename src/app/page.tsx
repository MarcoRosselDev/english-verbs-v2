import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <h1 className="font-mono text-2xl tracking-tight">
          Find any English verb<span className="text-accent">_</span>
        </h1>
        <p className="mt-2 text-muted">
          Search by English form or Spanish translation.
        </p>

        {/* Muestra de la paleta para comprobar ambos temas */}
        <div className="mt-8 rounded-lg border border-line bg-surface p-5">
          <p className="font-mono text-sm">surface · border · ink</p>
          <p className="mt-1 text-sm text-muted">muted text</p>
          <p className="mt-3 flex gap-4 font-mono text-sm">
            <span className="text-accent">accent</span>
            <span className="text-danger">danger</span>
          </p>
        </div>
      </main>
    </>
  );
}