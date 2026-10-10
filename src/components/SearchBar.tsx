type Props = { value: string; onChange: (value: string) => void };

export function SearchBar({ value, onChange }: Props) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">Search verbs</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-accent"
      >
        ›
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search: run, correr, went…"
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-md border border-line bg-surface py-2.5 pl-8 pr-3 font-mono text-sm placeholder:text-muted focus:border-accent"
      />
    </label>
  );
}