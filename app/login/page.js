"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        router.push(data.type === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
          <source src="https://res.cloudinary.com/tt7oyjd1/video/upload/v1791960191/okgs/film/odyssey-montage-v6.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6">
            ← Back to Home
          </Link>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400 flex items-center justify-center font-black text-slate-900 text-xl mb-4">OK</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-white/50 text-sm mt-2">Unified Login — Attendee / Admin / Staff</p>
        </div>

        <div className="bg-white rounded-[24px] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500">Phone / Email / Username</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="01XXXXXXXXX or email"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none text-sm"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">{error}</div>
            )}

            <button
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <div className="text-center text-xs text-slate-500 pt-2">
              No account? <Link href="/register" className="font-bold text-slate-900 hover:underline">Register here</Link>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Admin default: admin@okgs.edu.bd / Admin@123 (if not changed). User login with phone & password set during registration.
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-white/20 text-[11px] mt-6">Secure • Encrypted • Turso DB • JWT Auth</p>
      </div>
    </div>
  );
}
