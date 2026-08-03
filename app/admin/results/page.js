"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";

export default function ResultsPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [races, setRaces] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

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

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f7f7f4",
      });
      const link = document.createElement("a");
      link.download = "nabmes-election-results.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Couldn't generate the image. Try again.");
    } finally {
      setDownloading(false);
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

  const cecRaces = races.filter((r) => r.election === "CEC");
  const srcRaces = races.filter((r) => r.election === "SRC");
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex-1 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-1">
              Results
            </p>
            <h1 className="font-display tracking-tight text-3xl text-[var(--ink)]">
              Election tally
            </h1>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-lg bg-[var(--accent-ink)] text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 transition disabled:opacity-60 whitespace-nowrap"
          >
            {downloading ? "Generating…" : "Download image"}
          </button>
        </div>

        <div
          ref={cardRef}
          className="rounded-2xl border-2 border-[var(--accent-ink)] bg-[var(--bg)] p-8 mb-10"
        >
          <div className="flex items-center gap-2.5 justify-center mb-6">
            <img
              src="https://YOUR-PROJECT-REF.supabase.co/storage/v1/object/public/assets/nabmes-logo.png"
              alt="NABMES"
              crossOrigin="anonymous"
              className="h-10 w-10 rounded-full"
            />
            <div className="text-center">
              <p className="font-display text-base text-[var(--ink)] leading-tight">
                NABMES UNILORIN
              </p>
              <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--accent-ink)]">
                Official Election Results
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-[var(--ink-muted)] mb-6">{today}</p>

          <p className="font-display text-sm text-[var(--accent-ink)] uppercase tracking-wide mb-3">
            CEC
          </p>
          <div className="space-y-2 mb-6">
            {cecRaces.map((race) => {
              const winner = race.candidates.find((c) => c.isWinner);
              return (
                <div
                  key={race.position}
                  className="flex items-center justify-between border-b border-[var(--line)] pb-2"
                >
                  <span className="text-sm text-[var(--ink-muted)]">{race.position}</span>
                  <span className="text-sm font-medium text-[var(--ink)] text-right">
                    {winner ? winner.name : "—"}
                    {winner && (
                      <span className="font-mono text-xs text-[var(--ink-muted)] ml-2">
                        {winner.votes}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {srcRaces.length > 0 && (
            <>
              <p className="font-display text-sm text-[var(--accent-ink)] uppercase tracking-wide mb-3">
                SRC
              </p>
              <div className="space-y-2">
                {srcRaces.map((race) => {
                  const winners = race.candidates.filter((c) => c.isWinner);
                  return (
                    <div key={race.position} className="border-b border-[var(--line)] pb-2">
                      <p className="text-sm text-[var(--ink-muted)] mb-1">{race.position}</p>
                      {winners.map((w) => (
                        <div key={w.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[var(--ink)]">{w.name}</span>
                          <span className="font-mono text-xs text-[var(--ink-muted)]">
                            {w.votes}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <p className="font-display text-lg text-[var(--ink)] mb-4">Full breakdown</p>
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
                  className={`rounded-lg border px-4 py-3 ${
                    c.isWinner ? "border-[var(--accent-ink)] bg-[var(--accent-ink)]/5" : "border-[var(--line)] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--ink)] font-medium flex items-center gap-2">
                      {c.photoUrl && (
                        <img src={c.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover object-top" />
                      )}
                      {c.name}
                      {c.isWinner && (
                        <span className="text-xs font-mono text-[var(--accent-ink)] uppercase">Winner</span>
                      )}
                    </span>
                    <span className="font-mono text-[var(--ink)]">{c.votes}</span>
                  </div>
                  {Object.keys(c.byLevel).length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pl-9">
                      {Object.entries(c.byLevel)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([lvl, count]) => (
                          <span key={lvl} className="text-xs font-mono text-[var(--ink-muted)]">
                            {lvl}L: {count}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
