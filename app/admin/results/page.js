"use client";

import { useState } from "react";

export default function ResultsPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [races, setRaces] = useState(null);

  async function handleLoad(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/results?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Couldn't load results.");
        return;
      }
      setRaces(data.races);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server.");
    }
  }

  if (status !== "success") {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
            Results
          </p>
          <h1 className="font-display tracking-tight text-3xl text-[var(--ink)] mb-6">
            Admin access
          </h1>
          <form onSubmit={handleLoad} className="space-y-4">
            <input
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Admin key"
              className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {status === "error" && (
              <p className="text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-[var(--accent-ink)] text-white font-medium py-3 hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "loading" ? "Loading…" : "View results"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
          Results
        </p>
        <h1 className="font-display tracking-tight text-3xl text-[var(--ink)] mb-8">
          Live tally
        </h1>

        {races.map((race) => (
          <section key={`${race.election}-${race.position}`} className="mb-8">
            <h2 className="font-display text-lg text-[var(--ink)] mb-1">
              {race.election} — {race.position}
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mb-3">
              {race.totalVotes} vote{race.totalVotes === 1 ? "" : "s"} cast
              {race.election === "SRC" ? " · top 2 win" : ""}
            </p>
            <div className="space-y-1.5">
              {race.candidates.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
                    c.isLeading ? "border-[var(--accent-ink)] bg-[var(--accent-ink)]/5" : "border-[var(--line)] bg-white"
                  }`}
                >
                  <span className="text-[var(--ink)] font-medium">
                    {c.name}
                    {c.isLeading && (
                      <span className="ml-2 text-xs font-mono text-[var(--accent-ink)] uppercase">Leading</span>
                    )}
                  </span>
                  <span className="font-mono text-[var(--ink)]">{c.votes}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
