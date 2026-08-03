"use client";

import { useState, useEffect } from "react";

export default function VotePage() {
  const [pageStatus, setPageStatus] = useState("loading"); // loading | closed | ready
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("idle");
  const [loginError, setLoginError] = useState("");
  const [ballot, setBallot] = useState(null);
  const [srcChoice, setSrcChoice] = useState(null);
  const [cecChoices, setCecChoices] = useState({});
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setPageStatus(data.votingOpen ? "ready" : "closed"))
      .catch(() => setPageStatus("ready"));
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginStatus("loading");
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginStatus("error");
        setLoginError(data.error || "Login failed.");
        return;
      }
      await loadBallot();
    } catch {
      setLoginStatus("error");
      setLoginError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  async function loadBallot() {
    const res = await fetch("/api/ballot");
    const data = await res.json();
    if (!res.ok) {
      setLoginStatus("error");
      setLoginError(data.error || "Couldn't load the ballot.");
      return;
    }
    setBallot(data);
    setLoginStatus("success");
  }

  async function submitVote(election, selections) {
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ election, selections }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  }

  async function handleCastVotes() {
    setSubmitStatus("loading");
    setSubmitMessage("");

    const results = [];

    if (ballot.src.length > 0 && !ballot.hasVotedSrc) {
      const position = ballot.src[0].position;
      if (!srcChoice) {
        setSubmitStatus("error");
        setSubmitMessage("Pick a candidate for your SRC representative race.");
        return;
      }
      const r = await submitVote("SRC", { [position]: srcChoice });
      results.push(r);
    }

    if (!ballot.hasVotedCec) {
      const missing = ballot.cec.some((p) => !cecChoices[p.position]);
      if (missing) {
        setSubmitStatus("error");
        setSubmitMessage("Pick a candidate for every CEC position before submitting.");
        return;
      }
      const r = await submitVote("CEC", cecChoices);
      results.push(r);
    }

    const failed = results.find((r) => !r.ok);
    if (failed) {
      setSubmitStatus("error");
      setSubmitMessage(failed.data.error || "Couldn't submit your vote.");
      return;
    }

    setSubmitStatus("success");
    await loadBallot();
  }

  if (pageStatus === "loading") {
    return <main className="flex-1" />;
  }

  if (pageStatus === "closed") {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
            Voting
          </p>
          <h1 className="font-display tracking-tight text-3xl text-[var(--ink)] mb-4">
            Voting hasn&rsquo;t opened yet.
          </h1>
          <p className="text-[var(--ink-muted)]">Check back once polls are live.</p>
        </div>
      </main>
    );
  }

  if (loginStatus === "success" && ballot) {
    if (
      (ballot.src.length === 0 || ballot.hasVotedSrc) &&
      (ballot.cec.length === 0 || ballot.hasVotedCec)
    ) {
      return (
        <main className="flex-1 flex items-center justify-center px-6 py-16 text-center">
          <div className="max-w-md">
            <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
              Vote Recorded
            </p>
            <h1 className="font-display tracking-tight text-3xl text-[var(--ink)] mb-4">
              Thanks for voting.
            </h1>
            <p className="text-[var(--ink-muted)] mb-8">
              Your vote has been recorded. Results will be announced once polls close.
            </p>
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                window.location.reload();
              }}
              className="rounded-lg border border-[var(--line)] text-[var(--ink)] font-medium px-6 py-3 hover:bg-[var(--line)]/20 transition"
            >
              Done — sign out
            </button>
            <p className="text-xs text-[var(--ink-muted)] mt-4">
              Sharing this phone with someone else who still needs to vote? Tap this first.
            </p>
          </div>
        </main>
      );
    }

    return (
      <main className="flex-1 px-6 py-16">
        <div className="max-w-md mx-auto">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
            {ballot.level} Level Ballot
          </p>
          <h1 className="font-display tracking-tight text-3xl text-[var(--ink)] mb-8">
            Cast your vote
          </h1>

          {ballot.src.length > 0 && !ballot.hasVotedSrc && (
            <section className="mb-10">
              <h2 className="font-display text-xl text-[var(--ink)] mb-1">
                SRC — {ballot.src[0].position}
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mb-4">
                Top two by vote count represent your level.
              </p>
              <div className="space-y-2">
                {ballot.src[0].candidates.map((c) => (
                  <CandidateOption
                    key={c.id}
                    candidate={c}
                    selected={srcChoice === c.id}
                    onSelect={() => setSrcChoice(c.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {!ballot.hasVotedCec &&
            ballot.cec.map((race) => (
              <section key={race.position} className="mb-10">
                <h2 className="font-display text-xl text-[var(--ink)] mb-4">
                  CEC — {race.position}
                </h2>
                <div className="space-y-2">
                  {race.candidates.map((c) => (
                    <CandidateOption
                      key={c.id}
                      candidate={c}
                      selected={cecChoices[race.position] === c.id}
                      onSelect={() => setCecChoices((prev) => ({ ...prev, [race.position]: c.id }))}
                    />
                  ))}
                </div>
              </section>
            ))}

          {submitStatus === "error" && (
            <p role="alert" className="text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-lg px-4 py-3 mb-4">
              {submitMessage}
            </p>
          )}

          <button
            onClick={handleCastVotes}
            disabled={submitStatus === "loading"}
            className="w-full rounded-lg bg-[var(--accent-ink)] text-white font-medium py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {submitStatus === "loading" ? "Submitting…" : "Cast my vote"}
          </button>
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="matricNumber" className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Matric number
            </label>
            <input
              id="matricNumber"
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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your registration password"
              className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          {loginStatus === "error" && (
            <p role="alert" className="text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-lg px-4 py-3">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginStatus === "loading"}
            className="w-full rounded-lg bg-[var(--accent-ink)] text-white font-medium py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {loginStatus === "loading" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

function CandidateOption({ candidate, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-4 rounded-lg border px-4 py-3 text-left transition ${
        selected ? "border-[var(--accent-ink)] bg-[var(--accent-ink)]/5" : "border-[var(--line)] bg-white hover:border-[var(--accent-ink)]"
      }`}
    >
      {candidate.photo_url ? (
        <img
          src={candidate.photo_url}
          alt=""
          className="w-16 h-16 rounded-full object-cover object-top flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[var(--line)] flex-shrink-0" />
      )}
      <span className="text-[var(--ink)] font-medium">{candidate.name}</span>
    </button>
  );
}
