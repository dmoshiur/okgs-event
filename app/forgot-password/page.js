"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send a reset link.");
      setMessage(data.message);
    } catch (submitError) {
      setError(submitError.message || "Unable to send a reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-9">
        <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
          ← Back to sign in
        </Link>
        <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-lg font-black text-amber-900">
          ?
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950">Forgot your password?</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the phone number, email, or staff username on your account. If an email address is linked, we’ll send a single-use reset link.
        </p>

        {message ? (
          <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="reset-identifier" className="text-xs font-semibold text-slate-700">
                Phone, email, or staff username
              </label>
              <input
                id="reset-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                maxLength={254}
                placeholder="Enter your account details"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              />
            </div>
            {error ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
          Reset links expire after 30 minutes. Accounts without an email address need help from a school administrator.
        </p>
      </section>
    </main>
  );
}
