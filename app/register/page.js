"use client";

import { useState } from "react";

export default function RegisterPage() {
  // step: "matric" -> "confirm" -> "password" -> success card
  const [step, setStep] = useState("matric");

  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // holds the record we looked up before the student confirms it's them
  const [lookup, setLookup] = useState(null); // { fullName, department, level }

  async function handleLookup(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(
        `/api/lookup-voter?matricNumber=${encodeURIComponent(matricNumber)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(
          data.error ||
            "We couldn't find that matric number on the voter roll."
        );
        return;
      }

      setLookup(data);
      setStatus("idle");
      setStep("confirm");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server. Check your connection and try again.");
    }
  }

  function handleConfirmYes() {
    setStatus("idle");
    setMessage("");
    setStep("password");
  }

  function handleConfirmNo() {
    setStatus("idle");
    setMessage("");
    setLookup(null);
    setStep("matric");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricNumber, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Registration failed.");
        return;
      }

      setConfirmation(data);
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server. Check your connection and try again.");
    }
  }

  if (status === "success" && confirmation) {
    return <ConfirmationCard data={confirmation} />;
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-3">
          Voter Registration
        </p>
        <h1 className="font-display tracking-tight text-3xl sm:text-4xl text-[var(--ink)] mb-2">
          Register to vote
        </h1>

        {step === "matric" && (
          <>
            <p className="text-[var(--ink-muted)] mb-8 leading-relaxed">
              Enter your matric number exactly as it appears on your ID card.
            </p>

            <form onSubmit={handleLookup} className="space-y-5">
              <div>
                <label
                  htmlFor="matricNumber"
                  className="block text-sm font-medium text-[var(--ink)] mb-1.5"
                >
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

              {status === "error" && (
                <p
                  role="alert"
                  className="text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-lg px-4 py-3"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-[var(--accent-ink)] text-white font-medium py-3 hover:opacity-90 transition disabled:opacity-60"
              >
                {status === "loading" ? "Looking you up…" : "Continue"}
              </button>
            </form>
          </>
        )}

        {step === "confirm" && lookup && (
          <div className="space-y-6">
            <p className="text-[var(--ink-muted)] leading-relaxed">
              We found this on the voter roll for{" "}
              <span className="font-mono text-[var(--ink)]">{matricNumber}</span>:
            </p>

            <div className="rounded-lg border border-[var(--line)] bg-white px-5 py-4">
              <p className="text-lg font-medium text-[var(--ink)]">
                {lookup.fullName}
              </p>
              {(lookup.department || lookup.level) && (
                <p className="text-sm text-[var(--ink-muted)] mt-1">
                  {lookup.department}
                  {lookup.department && lookup.level ? " · " : ""}
                  {lookup.level ? `${lookup.level} Level` : ""}
                </p>
              )}
            </div>

            <p className="text-sm font-medium text-[var(--ink)]">Is this you?</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmYes}
                className="flex-1 rounded-lg bg-[var(--accent-ink)] text-white font-medium py-3 hover:opacity-90 transition"
              >
                Yes, this is me
              </button>
              <button
                type="button"
                onClick={handleConfirmNo}
                className="flex-1 rounded-lg border border-[var(--line)] text-[var(--ink)] font-medium py-3 hover:bg-[var(--line)]/20 transition"
              >
                No, not me
              </button>
            </div>

            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              If this isn&rsquo;t your name, don&rsquo;t continue — contact
              your class rep or the electoral committee before registering.
            </p>
          </div>
        )}

        {step === "password" && (
          <>
            <p className="text-[var(--ink-muted)] mb-8 leading-relaxed">
              Set a password you&rsquo;ll use on election day.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--ink)] mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[var(--ink)] mb-1.5"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>

              {status === "error" && (
                <p
                  role="alert"
                  className="text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-lg px-4 py-3"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-[var(--accent-ink)] text-white font-medium py-3 hover:opacity-90 transition disabled:opacity-60"
              >
                {status === "loading" ? "Registering…" : "Register"}
              </button>

              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="w-full text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition"
              >
                ← Back
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

function ConfirmationCard({ data }) {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="relative rounded-2xl border-2 border-[var(--accent-ink)] bg-white p-8 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-4 border-[var(--accent)] opacity-20 rotate-12" />
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent-ink)] mb-4">
            Registration Confirmed
          </p>
          <h1 className="font-display tracking-tight text-2xl text-[var(--ink)] mb-6">
            You&rsquo;re on the roll.
          </h1>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <dt className="text-[var(--ink-muted)]">Matric No.</dt>
              <dd className="font-mono text-[var(--ink)]">{data.matricNumber}</dd>
            </div>
            {data.department && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--ink-muted)]">Department</dt>
                <dd className="text-[var(--ink)]">{data.department}</dd>
              </div>
            )}
            {data.level && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--ink-muted)]">Level</dt>
                <dd className="text-[var(--ink)]">{data.level}</dd>
              </div>
            )}
          </dl>
          <p className="text-sm text-[var(--ink-muted)] mt-6 leading-relaxed">
            Keep your password safe — you&rsquo;ll use it to sign in and vote
            once polls open. Don&rsquo;t share it, even with course reps.
          </p>
        </div>
      </div>
    </main>
  );
}
