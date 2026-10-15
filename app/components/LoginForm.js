"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VIDEO_URL =
  "https://res.cloudinary.com/tt7oyjd1/video/upload/v1791960191/okgs/film/odyssey-montage-v6.mp4";

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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-sm font-black tracking-wide text-slate-700">
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
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.8 4.1 10 7-.4.9-1.1 2-2.1 3M6.2 6.2C3.9 7.7 2.5 10 2 12c1.2 2.9 4.8 7 10 7 1.3 0 2.5-.3 3.6-.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
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
      if (!response.ok) throw new Error(data.error || "Unable to sign in. Check your details and try again.");
      router.replace(data.redirect || (data.type === "admin" ? "/admin" : "/dashboard"));
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const schoolName = config?.school_name_1 || "OMAR KINDERGARTEN SCHOOL";
  const secondSchoolName = config?.school_name_2?.trim();
  const eventTitle = config?.event_title || "School Event Portal";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:px-6">
      <video
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="fixed inset-0 h-full w-full object-cover"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div aria-hidden="true" className="fixed inset-0 bg-slate-950/65" />
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[linear-gradient(135deg,rgba(9,16,27,0.42),rgba(15,23,42,0.12)_48%,rgba(9,16,27,0.54))]"
      />

      <section className="relative z-10 w-full max-w-[460px] rounded-[28px] border border-white/70 bg-white px-6 py-7 shadow-[0_28px_90px_rgba(0,0,0,0.38)] sm:px-10 sm:py-9">
        <header className="text-center">
          <div className="flex items-center justify-center gap-3">
            <SchoolLogo src={config?.school_logo_1} name={schoolName} />
            {config?.school_logo_2 ? (
              <SchoolLogo src={config.school_logo_2} name={secondSchoolName || "School"} />
            ) : null}
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.19em] text-slate-500">
            {schoolName}
          </p>
          {secondSchoolName ? (
            <p className="mt-1 text-xs text-slate-500">{secondSchoolName}</p>
          ) : null}
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-900">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <span className="truncate">{eventTitle}</span>
          </div>
          {config?.event_date ? (
            <p className="mt-1.5 text-[11px] text-slate-400">{config.event_date}</p>
          ) : null}
        </header>

        <div className="mt-7 border-t border-slate-100 pt-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Staff Sign-In · Attendee Access
          </p>
          <h1 className="mt-2 text-center text-[26px] font-black tracking-tight text-slate-950 sm:text-[30px]">
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">
            Sign in to manage attendance or open your event pass.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="login-identifier" className="text-xs font-semibold text-slate-700">
              Phone, email, or staff username
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <UserIcon />
              </span>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Enter your phone, email, or username"
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-amber-700 underline-offset-4 hover:text-amber-900 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative mt-2">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
          </div>

          {error ? (
            <div
              id="login-error"
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-200 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading ? (
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M3.5 10h12m-5-5 5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            ) : null}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <p className="text-xs text-slate-500">
            Need an event pass?{" "}
            <Link href="/register" className="font-bold text-slate-900 underline-offset-4 hover:underline">
              Register as an attendee
            </Link>
          </p>
          <p className="mt-4 text-[10px] leading-5 text-slate-400">
            Secure access for attendees, staff, and school administrators.
          </p>
        </div>
      </section>
    </main>
  );
}
