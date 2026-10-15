"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/app/components/Icons";
import SupportContact from "@/app/components/SupportContact";
import { DEFAULT_SUPPORT_PHONE } from "@/lib/constants";

const DEFAULT_LOGO = "/okgs-mark.svg";

// Primary navigation follows the sidebar order in the portal specification.
const PRIMARY_NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/users", label: "Students", icon: "students" },
  { href: "/admin/scan", label: "Scan", icon: "scan" },
  { href: "/admin/canteen", label: "Canteen", icon: "canteen" },
  { href: "/admin/funds", label: "Funds", icon: "funds" },
  { href: "/admin/dues", label: "Dues", icon: "dues" },
  { href: "/admin/expenses", label: "Expenses", icon: "expenses" },
  { href: "/admin/memos", label: "Memos", icon: "memos" },
  { href: "/admin/collections", label: "Collections", icon: "collections" },
];

// Existing operational pages stay reachable under Tools.
const TOOL_NAV = [
  { href: "/admin/attendance", label: "Attendance Logs", icon: "logs" },
  { href: "/admin/print", label: "Print Passes", icon: "print" },
  { href: "/admin/settings", label: "Branding Settings", icon: "settings" },
];

const SUPERADMIN_NAV = { href: "/admin/admins", label: "Staff Accounts", icon: "admins" };

// Mobile bottom bar: five tabs, with Scan as the elevated centre action.
const MOBILE_TABS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/users", label: "Students", icon: "students" },
  { href: "/admin/scan", label: "Scan", icon: "scan", center: true },
  { href: "/admin/print", label: "Tickets", icon: "tickets" },
];

function isActive(pathname, item) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Avatar({ name, className = "" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-amber-400 font-black text-slate-900 ${className}`}
      aria-hidden="true"
    >
      {(name || "A").charAt(0).toUpperCase()}
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setConfig(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white/60">
        Loading admin...
      </div>
    );
  }

  const isSuperadmin = user?.role === "superadmin";
  const tools = isSuperadmin ? [...TOOL_NAV, SUPERADMIN_NAV] : TOOL_NAV;
  const roleLabel = isSuperadmin ? "Super Admin" : "Staff";
  const schoolName = config?.school_name_1 || "OMAR KINDERGARTEN SCHOOL";
  const eventTitle = config?.event_title || "OKGS Genesis 2026";
  const logo = config?.school_logo_1 || DEFAULT_LOGO;
  const supportPhone = config?.support_phone || DEFAULT_SUPPORT_PHONE;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 hidden flex-col bg-slate-950 text-white transition-[width] duration-200 lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`flex items-center gap-3 border-b border-white/10 p-5 ${collapsed ? "justify-center" : ""}`}>
          <img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-1" />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black tracking-wide">{schoolName}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={`shrink-0 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white ${collapsed ? "absolute -right-3 top-6 border border-white/10 bg-slate-950" : ""}`}
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
          </button>
        </div>

        {!collapsed ? (
          <div className="px-4 pt-4">
            <label htmlFor="active-event" className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Active event
            </label>
            <div className="relative mt-2">
              <select
                id="active-event"
                value={eventTitle}
                onChange={() => {}}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900 py-2.5 pl-3 pr-9 text-sm font-semibold text-white outline-none focus:border-amber-400"
              >
                <option value={eventTitle}>{eventTitle}</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/50">
                <Icon name="chevronDown" className="h-4 w-4" />
              </span>
            </div>
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          <ul className="space-y-1">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      collapsed ? "justify-center" : ""
                    } ${active ? "bg-amber-400 font-bold text-slate-900" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                  >
                    <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          {!collapsed ? (
            <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Tools</p>
          ) : (
            <div className="my-4 border-t border-white/10" />
          )}
          <ul className="space-y-1">
            {tools.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                      collapsed ? "justify-center" : ""
                    } ${active ? "bg-white/10 font-semibold text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}
                  >
                    <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!collapsed ? (
          <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
            <p className="flex items-center gap-2 font-bold text-white">
              <Icon name="help" className="h-4 w-4 text-amber-400" /> Help &amp; support
            </p>
            <SupportContact phone={supportPhone} className="mt-2 leading-5 text-white/60" />
          </div>
        ) : null}

        <div className={`flex items-center gap-3 border-t border-white/10 p-4 ${collapsed ? "flex-col" : ""}`}>
          <Avatar name={user?.username} className="h-10 w-10 text-sm" />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{roleLabel}</p>
              <p className="truncate text-[11px] text-white/50">{user?.username} · Profile</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className={`flex items-center gap-2 rounded-xl border border-white/15 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white ${
              collapsed ? "p-2" : "px-3 py-2"
            }`}
          >
            <Icon name="logout" className="h-4 w-4" />
            {!collapsed ? "Sign out" : null}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="no-print fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-xl object-contain" />
          <div className="min-w-0">
            <p className="truncate text-xs font-black leading-tight text-slate-900">{schoolName}</p>
            <p className="truncate text-[11px] leading-tight text-slate-500">{eventTitle}</p>
          </div>
        </div>
        <Avatar name={user?.username} className="h-9 w-9 text-xs" />
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="no-print fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 items-end border-t border-slate-200 bg-white pb-1 lg:hidden"
      >
        {MOBILE_TABS.map((item) => {
          const active = isActive(pathname, item);
          if (item.center) {
            return (
              <div key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  aria-label="Scan QR passes"
                  className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-amber-400 shadow-lg ring-4 ring-white ${
                    active ? "ring-amber-200" : ""
                  }`}
                >
                  <Icon name="scan" className="h-6 w-6" />
                </Link>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold ${
                active ? "text-slate-950" : "text-slate-400"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className="flex flex-col items-center gap-1 py-2 text-[10px] font-semibold text-slate-400"
        >
          <Icon name="more" className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* Mobile "More" sheet */}
      {moreOpen ? (
        <div className="no-print fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More navigation">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-slate-900">More</p>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[...PRIMARY_NAV.slice(3), ...tools].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-3 text-center text-[11px] font-semibold text-slate-700"
                >
                  <Icon name={item.icon} className="h-5 w-5 text-slate-900" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-bold text-slate-900">Help &amp; support</p>
              <SupportContact phone={supportPhone} className="mt-2 leading-5" />
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white"
            >
              <Icon name="logout" className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      ) : null}

      {/* Content */}
      <main
        className={`admin-content min-h-screen pb-24 pt-20 transition-[margin] duration-200 lg:pb-0 lg:pt-0 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
