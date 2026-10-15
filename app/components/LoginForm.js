"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthScreen from "@/app/components/AuthScreen";
import CornerFrame from "@/app/components/CornerFrame";
import { toDialNumber, toWhatsAppNumber } from "@/app/components/SupportContact";
import { Icon } from "@/app/components/Icons";
import { DEFAULT_SUPPORT_PHONE } from "@/lib/constants";

function SchoolLogo({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || "OKGS")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => setFailed(false), [src]);

  return (
    <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xs border border-line bg-paper-2 text-xs font-black tracking-wide text-ink-900">
      {src && !failed ? (
        <img
          src={src}
          alt={`${name || "School"} logo`}
          className="h-full w-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        initials || "OKGS"
      )}
    </span>
  );
}

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

  const schoolName = config?.school_name_1 || "OMAR KINDERGARTEN SCHOOL";
  const secondSchoolName = config?.school_name_2?.trim();
  const eventTitle = config?.event_title || "Omar Kindergarten School Event Portal";
  const supportPhone = config?.support_phone || DEFAULT_SUPPORT_PHONE;

  return (
    <AuthScreen>
      <section className="reveal relative z-10 w-full max-w-sm mx-auto p-5 sm:p-6 rounded-2xl bg-white shadow-xl">
        {/* 90-degree corner frame around the sign-in card viewport. */}
        <CornerFrame size={40} inset={8} tone="gold" className="sm:hidden" />
        <CornerFrame size={90} inset={10} tone="gold" className="hidden sm:block" />

        <header className="relative text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <SchoolLogo src={config?.school_logo_1} name={schoolName} />
            {config?.school_logo_2 ? (
              <SchoolLogo src={config.school_logo_2} name={secondSchoolName || "School"} />
            ) : null}
          </div>

          <div className="space-y-1">
            <h1 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ink-900">
              {schoolName}
            </h1>
            {secondSchoolName ? (
              <p className="text-xs text-muted">{secondSchoolName}</p>
            ) : null}

            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gold-deep">
              Staff sign in
            </p>

            <p className="text-xs leading-5 text-muted-2">{eventTitle}</p>
          </div>

          <div className="flex justify-center">
            <span className="pill pill-gold max-w-full text-xs">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="truncate">{eventTitle}</span>
            </span>
          </div>
          {config?.event_date ? (
            <p className="text-[11px] tracking-wide text-muted-2">{config.event_date}</p>
          ) : null}
        </header>

        <div className="relative mt-4 border-t border-line pt-3 text-center space-y-2">
          <p className="eyebrow justify-center text-xs">
            <span>Staff Sign-In · Attendee Access</span>
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink-950 sm:text-[26px]">
            Welcome back
          </h2>
          <p className="mx-auto max-w-[34ch] text-xs leading-5 text-muted">
            Sign in to manage attendance or open your event pass.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative mt-4 space-y-3">
          <div className="field mb-0 space-y-1">
            <label htmlFor="login-identifier" className="field-label">
              Student ID / email / phone
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
                placeholder="Student ID / email / phone"
                className="input input-icon py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="field mb-0 space-y-1">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <Link href="/forgot-password" className="link-underline text-xs">
                Forgot your password?
              </Link>
            </div>
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
            {loading ? "Signing in…" : "Sign in"}
            {!loading ? <Icon name="arrowRight" className="h-4 w-4" /> : null}
          </button>
        </form>

        <div className="relative mt-4 border-t border-line pt-3 text-center space-y-2">
          <p className="text-sm text-muted">
            Need an event pass?{" "}
            <Link href="/register" className="link-underline text-ink-900">
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
            ) | Secure access for attendees, staff, and school administrators.
          </p>
        </div>
      </section>
    </AuthScreen>
  );
}
