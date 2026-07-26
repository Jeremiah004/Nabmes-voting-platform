export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-4">
        Department Elections · 2025/2026
      </p>
      <h1 className="font-display tracking-tight text-4xl sm:text-5xl text-[var(--ink)] max-w-2xl leading-tight mb-5">
        One matric number.
        <br />
        One vote.
      </h1>
      <p className="text-[var(--ink-muted)] max-w-md mb-10 leading-relaxed">
        Register now with your matric number so you&rsquo;re ready to vote
        when polls open. Registration takes less than a minute.
      </p>
      
        href="/register"
        className="inline-flex items-center rounded-lg bg-[var(--accent-ink)] text-white font-medium px-8 py-3.5 hover:opacity-90 transition"
      >
        Register to vote
      </a>
    </main>
  );
}
