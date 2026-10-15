"use client";

import { useState } from "react";
import Link from "next/link";
import AuthScreen from "@/app/components/AuthScreen";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

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
    <AuthScreen>
      <section className="reveal relative z-10 w-full max-w-[470px] border border-line-strong bg-surface-warm p-7 shadow-floated sm:p-9">
        <CornerFrame size={54} inset={10} tone="gold" className="sm:hidden" />
        <CornerFrame size={130} inset={14} tone="gold" className="hidden sm:block" />

        <div className="relative">
          <Link href="/login" className="link-underline text-xs">
            ← Back to sign in
          </Link>

          <p className="eyebrow mt-7">
            <span>Account recovery</span>
          </p>
          <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-ink-950">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter the phone number, email, or staff username on your account. If an email address is
            linked, we&apos;ll send a single-use reset link.
          </p>

          {message ? (
            <p role="status" className="alert alert-success mt-6">
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label htmlFor="reset-identifier" className="field mb-0">
                <span className="field-label">Phone, email, or staff username</span>
                <div className="relative">
                  <span className="field-icon">
                    <Icon name="user" className="h-5 w-5" />
                  </span>
                  <input
                    id="reset-identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    required
                    maxLength={254}
                    placeholder="Enter your account details"
                    className="input input-icon"
                  />
                </div>
              </label>

              {error ? (
                <p role="alert" className="alert alert-error">
                  {error}
                </p>
              ) : null}

              <button disabled={loading} className="btn btn-ink btn-shine w-full">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-6 border-t border-line pt-4 text-center text-[11px] leading-5 text-muted-2">
            Reset links expire after 30 minutes. Accounts without an email address need help from a
            school administrator.
          </p>
        </div>
      </section>
    </AuthScreen>
  );
}
