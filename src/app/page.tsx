import { Header } from "@/components/Header";
import { VerbBrowser } from "@/components/VerbBrowser";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="font-mono text-2xl tracking-tight">
          Find any English verb<span className="text-accent">_</span>
        </h1>
        <p className="mb-8 mt-2 text-muted">Search by English form or Spanish translation.</p>
        <VerbBrowser />
      </main>
    </>
  );
}