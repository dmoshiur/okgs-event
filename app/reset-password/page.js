"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthScreen from "@/app/components/AuthScreen";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            Choose a new password
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use at least 8 characters. The reset link is single-use.
          </p>

          {ready && !token ? (
            <p role="alert" className="alert alert-error mt-6">
              This reset link is missing or invalid. Request a new link to continue.
            </p>
          ) : null}

          {message ? (
            <p role="status" className="alert alert-success mt-6">
              {message}
            </p>
          ) : null}

          {ready && token && !message ? (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label htmlFor="new-password" className="field mb-0">
                <span className="field-label">New password</span>
                <div className="relative">
                  <span className="field-icon">
                    <Icon name="key" className="h-5 w-5" />
                  </span>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={72}
                    className="input input-icon pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="input-affix-btn"
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                  </button>
                </div>
              </label>

              <label htmlFor="confirm-password" className="field mb-0">
                <span className="field-label">Confirm new password</span>
                <div className="relative">
                  <span className="field-icon">
                    <Icon name="key" className="h-5 w-5" />
                  </span>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={72}
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
                {loading ? "Updating password…" : "Update password"}
              </button>
            </form>
          ) : null}

          {!token && ready ? (
            <Link href="/forgot-password" className="btn btn-gold mt-6 w-full">
              Request another reset link
            </Link>
          ) : null}

          {message ? (
            <Link href="/login" className="btn btn-gold mt-6 w-full">
              Continue to sign in
            </Link>
          ) : null}
        </div>
      </section>
    </AuthScreen>
  );
}
