"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
    setReady(true);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset the password.");
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(submitError.message || "Unable to reset the password.");
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
        <h1 className="mt-7 text-2xl font-black tracking-tight text-slate-950">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Use at least 8 characters. The reset link is single-use.</p>

        {ready && !token ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700" role="alert">
            This reset link is missing or invalid. Request a new link to continue.
          </div>
        ) : null}
        {message ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800" role="status">
            {message}
          </div>
        ) : null}

        {ready && token && !message ? (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="new-password" className="text-xs font-semibold text-slate-700">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={72}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-700">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                maxLength={72}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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
              {loading ? "Updating password…" : "Update password"}
            </button>
          </form>
        ) : null}

        {!token && ready ? (
          <Link href="/forgot-password" className="mt-6 block text-center text-sm font-bold text-amber-800 hover:underline">
            Request another reset link
          </Link>
        ) : null}
        {message ? (
          <Link href="/login" className="mt-6 block text-center text-sm font-bold text-amber-800 hover:underline">
            Continue to sign in
          </Link>
        ) : null}
      </section>
    </main>
  );
}
