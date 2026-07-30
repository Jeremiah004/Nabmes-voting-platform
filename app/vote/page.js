"use client";

import { useState } from "react";

export default function VotePage() {
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricNumber, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Login failed.");
        return;
      }

      setSession(data);
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server. Check your connection and try again.");
    }
  }

  if (status === "success" && session) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
            Signed In
          </p>
          <h1 className="font-display tracking-tight text-3xl text-[var(--ink)] mb-4">
            You&rsquo;re in.
          </h1>
          <p className="text-[var(--ink-muted)] leading-relaxed">
            Ballots aren&rsquo;t open yet — check back once voting starts.
            SRC: {session.hasVotedSrc ? "already voted" : "not yet voted"}. CEC:{" "}
            {session.hasVotedCec ? "already voted" : "not yet voted"}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
          Voting
        </p>
        <h1 className="font-display tracking-tight text-3xl sm:text-4xl text-[var(--ink)] mb-2">
          Sign in to vote
        </h1>
        <p className="text-[var(--ink-muted)] mb-8 leading-relaxed">
          Use the matric number and password you set during registration.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="matricNumber" className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Matric number
            </label>
            <input
              id="matricNumber"
              name="matricNumber"
              type="text"
              autoComplete="off"
              required
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              placeholder="e.g. 20/30GM045"
              className="w-full font-mono rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your registration password"
              className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-lg px-4 py-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-[var(--accent-ink)] text-white font-medium py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "loading" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
