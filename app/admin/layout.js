"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/app/components/Icons";
import CornerFrame from "@/app/components/CornerFrame";
import SupportContact from "@/app/components/SupportContact";
import { DEFAULT_SUPPORT_PHONE, DEFAULT_SCHOOL_NAME, SCHOOL_LOGO_URL } from "@/lib/constants";

const DEFAULT_EVENT_TITLE = "Annual School Function & Farewell";

// Primary sidebar, in the order required by the portal specification.
const PRIMARY_NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/users", label: "Users", icon: "students" },
  { href: "/admin/analytics", label: "Batch Analytics", icon: "analytics" },
  { href: "/admin/scan", label: "Live Scan", icon: "scan" },
  { href: "/admin/notices", label: "Notices", icon: "bell" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

// Operational pages that sit beneath the primary modules.
const TOOL_NAV = [
  { href: "/admin/attendance", label: "Attendance Logs", icon: "logs" },
  { href: "/admin/print", label: "Print Passes", icon: "print" },
];

const SUPERADMIN_NAV = { href: "/admin/admins", label: "Staff Accounts", icon: "admins" };

// Mobile bottom bar: four tabs, with Live Scan as the elevated centre action.
const MOBILE_TABS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/users", label: "Users", icon: "students" },
  { href: "/admin/scan", label: "Live Scan", icon: "scan", center: true },
  { href: "/admin/print", label: "Tickets", icon: "tickets" },
];

function isActive(pathname, item) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Avatar({ name, className = "" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xs bg-gold font-black text-ink-950 ${className}`}
      aria-hidden="true"
    >
      {(name || "A").charAt(0).toUpperCase()}
    </span>
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-950 text-white/60">
        <span className="h-6 w-6 animate-spin rounded-full border border-white/20 border-t-gold" />
        <p className="eyebrow eyebrow-light mb-0">Loading admin console</p>
      </div>
    );
  }

  const isSuperadmin = user?.role === "superadmin";
  const tools = isSuperadmin ? [...TOOL_NAV, SUPERADMIN_NAV] : TOOL_NAV;
  const mobileHrefs = new Set(MOBILE_TABS.map((item) => item.href));
  const moreItems = [
    ...PRIMARY_NAV.filter((item) => !mobileHrefs.has(item.href)),
    ...tools.filter((item) => !mobileHrefs.has(item.href)),
  ];
  const roleLabel = isSuperadmin ? "Super Admin" : "Staff";
  const schoolName = config?.school_name_1 || DEFAULT_SCHOOL_NAME;
  const eventTitle = config?.event_title || DEFAULT_EVENT_TITLE;
  const logo = config?.school_logo_1 || SCHOOL_LOGO_URL;
  const supportPhone = config?.support_phone || DEFAULT_SUPPORT_PHONE;

  return (
    <div className="min-h-screen bg-paper text-[#1b2430]">
      {/* Desktop sidebar — deep academic ink chrome. */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/5 bg-ink-950 text-white transition-[width] duration-200 lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div
          className={`relative flex items-center gap-3 border-b border-white/10 p-5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <img
            src={logo}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xs border border-white/10 bg-white object-contain p-1"
          />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[13px] font-semibold tracking-wide text-white">
                {schoolName}
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.2em] text-gold-soft">
                Event Console
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={`shrink-0 rounded-xs p-1.5 text-white/60 hover:bg-white/10 hover:text-white ${
              collapsed ? "absolute -right-3 top-6 border border-white/10 bg-ink-950" : ""
            }`}
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
          </button>
        </div>

        {!collapsed ? (
          <div className="px-4 pt-4">
            <label
              htmlFor="active-event"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"
            >
              Active event
            </label>
            <div className="relative mt-2">
              <select
                id="active-event"
                value={eventTitle}
                onChange={() => {}}
                className="w-full appearance-none rounded-xs border border-gold/25 bg-ink-900 py-2.5 pl-3 pr-9 text-sm font-semibold text-white outline-none focus:border-gold"
              >
                <option value={eventTitle}>{eventTitle}</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gold-soft">
                <Icon name="chevronDown" className="h-4 w-4" />
              </span>
            </div>
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          <ul className="space-y-0.5">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`nav-item ${collapsed ? "justify-center" : ""} ${
                      active ? "nav-item-active" : ""
                    }`}
                  >
                    <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          {!collapsed ? (
            <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              Tools
            </p>
          ) : (
            <div className="my-4 border-t border-white/10" />
          )}
          <ul className="space-y-0.5">
            {tools.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`nav-item ${collapsed ? "justify-center" : ""} ${
                      active ? "nav-item-active" : ""
                    }`}
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
          <div className="relative mx-3 mb-3 border border-white/10 bg-white/[0.04] p-4 text-xs text-white/70">
            <CornerFrame size={26} inset={6} tone="gold-soft" />
            <p className="relative flex items-center gap-2 font-bold text-white">
              <Icon name="help" className="h-4 w-4 text-gold" /> Help &amp; support
            </p>
            <SupportContact phone={supportPhone} className="relative mt-2 leading-5 text-white/60" />
          </div>
        ) : null}

        <div className={`flex items-center gap-3 border-t border-white/10 p-4 ${collapsed ? "flex-col" : ""}`}>
          <Avatar name={user?.username} className="h-10 w-10 text-sm" />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{roleLabel}</p>
              <p className="truncate text-[11px] text-white/45">{user?.username} · Profile</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className={`flex items-center gap-2 rounded-xs border border-white/15 text-xs font-semibold text-white/80 hover:border-gold/50 hover:bg-white/10 hover:text-white ${
              collapsed ? "p-2" : "px-3 py-2"
            }`}
          >
            <Icon name="logout" className="h-4 w-4" />
            {!collapsed ? "Sign out" : null}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="no-print fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-xs border border-line object-contain" />
          <div className="min-w-0">
            <p className="truncate font-display text-[12.5px] font-semibold leading-tight text-ink-900">
              {schoolName}
            </p>
            <p className="truncate text-[11px] leading-tight text-gold-deep">{eventTitle}</p>
          </div>
        </div>
        <Avatar name={user?.username} className="h-9 w-9 text-xs" />
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="no-print fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 items-end border-t border-line bg-surface pb-1 lg:hidden"
      >
        {MOBILE_TABS.map((item) => {
          const active = isActive(pathname, item);
          if (item.center) {
            return (
              <div key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  aria-label="Scan QR passes"
                  className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-xs bg-ink-950 text-gold shadow-floated ring-4 ring-paper ${
                    active ? "ring-gold-soft" : ""
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
                active ? "text-ink-950" : "text-muted-2"
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
          className="flex flex-col items-center gap-1 py-2 text-[10px] font-semibold text-muted-2"
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
            className="absolute inset-0 bg-ink-950/60"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto border-t border-line bg-surface p-5 pb-8 shadow-floated">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-semibold text-ink-900">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="rounded-xs p-2 text-muted hover:bg-paper-2"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-2 rounded-xs border border-line p-3 text-center text-[11px] font-semibold text-body-soft hover:border-gold"
                >
                  <Icon name={item.icon} className="h-5 w-5 text-ink-900" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-5">
              <label htmlFor="mobile-active-event" className="field-label">
                Active event
              </label>
              <select
                id="mobile-active-event"
                value={eventTitle}
                onChange={() => {}}
                className="select mt-2 text-sm font-semibold"
              >
                <option value={eventTitle}>{eventTitle}</option>
              </select>
            </div>
            <div className="relative mt-5 border border-line bg-paper-2 p-4 text-xs text-muted">
              <CornerFrame size={22} inset={5} tone="gold" />
              <p className="relative font-bold text-ink-900">Help &amp; support</p>
              <SupportContact phone={supportPhone} className="relative mt-2 leading-5" />
            </div>
            <button type="button" onClick={logout} className="btn btn-ink mt-4 w-full">
              <Icon name="logout" className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      ) : null}

      {/* Content */}
      <main
        className={`admin-content min-h-screen bg-paper pb-24 pt-20 transition-[margin] duration-200 lg:pb-0 lg:pt-0 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="mx-auto max-w-[1240px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
