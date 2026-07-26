"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [matricNumber, setMatricNumber] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber,
          registrationCode,
          password,
          confirmPassword,
        }),
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
        <p className="text-[var(--ink-muted)] mb-8 leading-relaxed">
          Enter your matric number and the registration code your course
          rep sent you privately, then set a password you&rsquo;ll use on
          election day.
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
            <label htmlFor="registrationCode" className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Registration code
            </label>
            <input
              id="registrationCode"
              name="registrationCode"
              type="text"
              autoComplete="off"
              required
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              placeholder="Sent to you privately by your course rep"
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--ink)] mb-1.5">
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
            <p role="alert" className="text-sm text-[var(--error)] bg-[var(--error-bg)] rounded-lg px-4 py-3">
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
        </form>
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
