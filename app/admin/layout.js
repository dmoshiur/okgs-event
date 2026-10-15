"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.type !== "admin") {
          router.push("/login");
          return;
        }
        setUser(data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white/60">Loading admin...</div>;
  }

  const nav = [
    { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
    { href: "/admin/users", label: "Users Directory", icon: "👥" },
    { href: "/admin/scan", label: "QR Gate Scanner", icon: "📷" },
    { href: "/admin/print", label: "Print Passes", icon: "🖨️" },
    { href: "/admin/attendance", label: "Attendance Logs", icon: "📋" },
    { href: "/admin/settings", label: "Branding Settings", icon: "⚙️" },
    ...(user?.role === "superadmin" ? [{ href: "/admin/admins", label: "Admins RBAC", icon: "🔐" }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="no-print w-64 bg-slate-900 text-white flex flex-col fixed h-screen z-40 hidden lg:flex">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black">OK</div>
            <div>
              <p className="font-bold text-sm">OKGS Admin</p>
              <p className="text-[11px] text-white/50">{user?.role} • {user?.username}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active ? "bg-white text-slate-900 font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/login" className="block text-center text-xs text-white/40 hover:text-white/80 py-2">← Sign-in page</Link>
          <button onClick={logout} className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white/70 py-2 rounded-xl text-xs">Logout</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="no-print lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs">OK</div>
          <span className="font-bold text-sm">Admin</span>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {nav.slice(0,4).map(n=>(
            <Link key={n.href} href={n.href} className="text-[11px] bg-white/10 px-2 py-1 rounded-full">{n.icon}</Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="admin-content flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
