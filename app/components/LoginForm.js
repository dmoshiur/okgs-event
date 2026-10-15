"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthScreen from "@/app/components/AuthScreen";
import CornerFrame from "@/app/components/CornerFrame";
import { toDialNumber, toWhatsAppNumber } from "@/app/components/SupportContact";
import { Icon } from "@/app/components/Icons";
import { DEFAULT_SCHOOL_NAME, DEFAULT_SUPPORT_PHONE, SCHOOL_LOGO_URL } from "@/lib/constants";

export default function LoginForm({ config }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (active && data?.authenticated) {
          router.replace(data.type === "admin" ? "/admin" : "/dashboard");
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in. Check your details and try again.");
      }
      router.replace(data.redirect || (data.type === "admin" ? "/admin" : "/dashboard"));
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const schoolName = config?.school_name_1 || DEFAULT_SCHOOL_NAME;
  const logoUrl = config?.school_logo_1 || SCHOOL_LOGO_URL;
  const supportPhone = config?.support_phone || DEFAULT_SUPPORT_PHONE;

  return (
    <AuthScreen>
      {/* Compact, centred sign-in card — never stretched, never taller than it needs to be. */}
      <section className="reveal relative z-10 w-full max-w-sm sm:max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-white shadow-2xl">
        {/* 90-degree L-bracket frame hugging the card edge: thin 1px amber-500/60
            strokes, one right-angle pair per corner, absolutely positioned inside. */}
        <CornerFrame
          size="clamp(34px, 11vw, 56px)"
          inset={10}
          thickness={1}
          tone="amber"
          className="[&>span]:border-amber-500/60"
        />

        <div className="space-y-4">
          {/* Clean branding header: logo, school name, section subtitle — nothing else. */}
          <header className="relative text-center space-y-3">
            <img
              src={logoUrl}
              alt={`${schoolName} logo`}
              width={48}
              height={48}
              className="h-12 w-12 object-contain mx-auto"
            />
            <div className="space-y-1.5">
              {/* School name stays on one continuous line on every screen size. */}
              <h1 className="whitespace-nowrap text-base sm:text-lg font-serif tracking-wider uppercase text-center text-ink-900">
                {schoolName}
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gold-deep">
                STAFF SIGN-IN · ATTENDEE ACCESS
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="relative space-y-4">
            <div className="field mb-0 space-y-1">
              <label htmlFor="login-identifier" className="field-label">
                User ID / Email / Phone
              </label>
              <div className="relative">
                <span className="field-icon">
                  <Icon name="user" className="h-4 w-4" />
                </span>
                <input
                  id="login-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="User ID / Email / Phone"
                  className="input input-icon py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="field mb-0 space-y-1">
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <div className="relative">
                <span className="field-icon">
                  <Icon name="key" className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="input input-icon pr-12 py-2 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="input-affix-btn"
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error ? (
              <p id="login-error" role="alert" className="alert alert-error text-sm">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-ink btn-shine w-full gap-2 py-2 text-sm"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <footer className="relative border-t border-line pt-3 text-center space-y-2">
            <p className="text-sm text-muted">
              <Link href="/forgot-password" className="link-underline text-ink-900">
                Forgot your password?
              </Link>
            </p>
            <p className="text-sm text-muted">
              Need an event pass?{" "}
              <Link href="/register" className="link-underline font-semibold text-ink-900">
                Register as an attendee
              </Link>
            </p>
            <p className="text-[11px] leading-5 text-muted">
              Support:{" "}
              <a
                href={`tel:${toDialNumber(supportPhone)}`}
                className="font-bold text-ink-900 underline-offset-4 hover:underline"
              >
                {supportPhone}
              </a>{" "}
              (
              <a
                href={`tel:${toDialNumber(supportPhone)}`}
                className="underline-offset-4 hover:text-ink-900 hover:underline"
              >
                Call
              </a>
              /
              <a
                href={`https://wa.me/${toWhatsAppNumber(supportPhone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-ink-900 hover:underline"
              >
                WhatsApp
              </a>
              )
            </p>
          </footer>
        </div>
      </section>
    </AuthScreen>
  );
}
