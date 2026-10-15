"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthScreen from "@/app/components/AuthScreen";
import CornerFrame from "@/app/components/CornerFrame";
import { toDialNumber, toWhatsAppNumber } from "@/app/components/SupportContact";
import { Icon } from "@/app/components/Icons";
import { DEFAULT_SUPPORT_PHONE } from "@/lib/constants";

/** Canonical OKGS mark served from Cloudinary. */
const SCHOOL_LOGO_URL =
  "https://res.cloudinary.com/tt7oyjd1/image/upload/okgs/okgs-logo.png";

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
  const supportPhone = config?.support_phone || DEFAULT_SUPPORT_PHONE;

  return (
    <AuthScreen>
      <section className="reveal relative z-10 w-full max-w-md mx-4 p-6 sm:p-8 rounded-2xl bg-white shadow-xl">
        {/* 90-degree corner frame around the sign-in card viewport. */}
        <CornerFrame size={40} inset={8} tone="gold" className="sm:hidden" />
        <CornerFrame size={90} inset={10} tone="gold" className="hidden sm:block" />

        <div className="space-y-4">
          {/* Clean branding header: logo, school name, section subtitle — nothing else. */}
          <header className="relative text-center space-y-3">
            <img
              src={SCHOOL_LOGO_URL}
              alt={`${schoolName} logo`}
              className="h-12 w-12 object-contain mx-auto"
            />
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold tracking-wide text-center whitespace-nowrap text-ink-900">
                {schoolName}
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gold-deep">
                Staff sign in
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="relative space-y-3">
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

          <div className="relative border-t border-line pt-3 text-center space-y-2">
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
              )
            </p>
          </div>
        </div>
      </section>
    </AuthScreen>
  );
}
