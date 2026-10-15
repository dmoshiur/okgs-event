"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CornerFrame from "@/app/components/CornerFrame";
import SupportContact from "@/app/components/SupportContact";
import { Icon } from "@/app/components/Icons";
import { DEFAULT_SUPPORT_PHONE, TICKET_BACKGROUND_URL } from "@/lib/constants";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        if (meData.type !== "user") {
          router.push("/login");
          return;
        }

        const [cfgRes, userRes, attRes] = await Promise.all([
          fetch("/api/admin/config"),
          fetch("/api/user/me"),
          fetch("/api/user/attendance"),
        ]);

        if (cfgRes.ok) setConfig(await cfgRes.json());
        setUser(userRes.ok ? await userRes.json() : meData);
        if (attRes.ok) setAttendance((await attRes.json()).logs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper text-muted">
        <span className="h-6 w-6 animate-spin rounded-full border border-line-strong border-t-gold" />
        <p className="eyebrow mb-0">Loading your pass</p>
      </div>
    );
  }

  if (!user) return null;

  const ticketBg = TICKET_BACKGROUND_URL;
  const supportPhone = config?.support_phone || DEFAULT_SUPPORT_PHONE;

  return (
    <div className="min-h-screen bg-paper">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img
              src={config?.school_logo_1 || "/okgs-mark.svg"}
              alt=""
              className="h-9 w-9 rounded-xs border border-line object-contain"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-[13px] font-semibold text-ink-900">
                {config?.school_name_1 || "OMAR KINDERGARTEN SCHOOL"}
              </span>
              <span className="block truncate text-[11px] text-gold-deep">
                {config?.event_title || "Event Portal"}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">
              {user.name} • {user.user_code}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              <Icon name="logout" className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1240px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Pass */}
        <div className="lg:col-span-2">
          <p className="eyebrow">Attendee pass</p>
          <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink-950">
            Your event pass
          </h1>
          <p className="page-lead">Show this QR at the gate. Printing to A4 is recommended.</p>

          <div className="print-area relative mt-6 border border-line bg-surface shadow-raised">
            <CornerFrame size={52} inset={10} tone="gold" className="no-print hidden sm:block" />

            <div
              className="print-ticket relative h-[460px] w-full overflow-hidden bg-ink-950"
              style={{ backgroundImage: `url(${ticketBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="absolute inset-0 bg-ink-950/72" />
              <div className="relative z-10 flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-2">
                    <img
                      src={config?.school_logo_1 || "/okgs-mark.svg"}
                      alt="Primary school logo"
                      className="h-11 w-11 rounded-xs border border-white/10 bg-white object-contain p-1"
                    />
                    {config?.school_logo_2 ? (
                      <img
                        src={config.school_logo_2}
                        alt="Secondary school logo"
                        className="h-11 w-11 rounded-xs border border-white/10 bg-white object-contain p-1"
                      />
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xs font-semibold text-white">
                      {config?.school_name_1 || "OMAR KINDERGARTEN SCHOOL"}
                    </p>
                    {config?.school_name_2 ? (
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gold-soft">
                        {config.school_name_2}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-6">
                  <img
                    src={user.photo_url}
                    alt={user.name}
                    className="h-24 w-24 rounded-xs border border-white/20 object-cover"
                  />
                  <div className="border border-white/20 bg-white p-2">
                    <img src={user.qr_code_url} alt="QR pass" className="h-28 w-28" />
                  </div>
                  <div className="pb-1 text-white">
                    <h2 className="font-display text-lg font-semibold leading-tight">{user.name}</h2>
                    <p className="mt-1 text-xs text-white/70">
                      {user.phone}
                      {user.email ? ` • ${user.email}` : ""}
                    </p>
                    <p className="mt-1 text-xs font-bold tracking-[0.14em] text-gold-soft">
                      {user.user_code}
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">
                      {user.division}, {user.district}, {user.upazila}, {user.union_name}
                    </p>
                    {user.institute ? (
                      <p className="text-[11px] text-white/50">
                        {user.institute} {user.ssc_batch ? `• Batch ${user.ssc_batch}` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-white/15 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Event</p>
                    <p className="font-display text-sm font-semibold text-white">
                      {config?.event_title || "Omar Kindergarten School Event"}
                    </p>
                    <p className="text-[11px] text-white/60">
                      {config?.event_date} {config?.event_location ? `• ${config.event_location}` : ""}
                    </p>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                    A4 ticket • 210×297mm
                  </p>
                </div>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-line bg-gold-tint px-4 py-3">
              <p className="text-[11px] leading-5 text-gold-deep">
                Present this QR at the entry gate. Valid for one person and non-transferable.
              </p>
              <button onClick={() => window.print()} className="btn btn-ink btn-sm">
                <Icon name="print" className="h-4 w-4" /> Print A4
              </button>
            </div>
          </div>

          {/* Attendance history */}
          <section className="relative mt-8 border border-line bg-surface p-6">
            <CornerFrame size={34} inset={9} tone="gold" />
            <p className="eyebrow relative">Gate activity</p>
            <h2 className="relative font-display text-lg font-semibold text-ink-900">
              Entry / exit history
            </h2>
            {attendance.length === 0 ? (
              <p className="relative mt-3 text-xs text-muted">
                No scan logs yet. Your check-in will appear here after the gate scan.
              </p>
            ) : (
              <div className="relative mt-4 space-y-3">
                {attendance.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0"
                  >
                    <span
                      className={`tag ${
                        log.type === "check_in" ? "tag-success" : "tag-warning"
                      } uppercase`}
                    >
                      {log.type === "check_in" ? "Check-in" : "Check-out"}
                    </span>
                    <span className="text-xs text-muted">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-[11px] text-muted-2">by {log.scanned_by_name || "System"}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="relative border border-line-strong bg-ink-950 p-6 text-white">
            <CornerFrame size={96} inset={12} tone="gold-soft" className="hidden sm:block" />
            <div className="relative">
              <p className="eyebrow eyebrow-light">Quick actions</p>
              <div className="space-y-3">
                <button onClick={() => window.print()} className="btn btn-gold w-full">
                  <Icon name="print" className="h-4 w-4" /> Print A4 ticket
                </button>
                <a
                  href={user.qr_code_url}
                  download={`${user.user_code}-qr.png`}
                  className="btn btn-outline-light w-full"
                >
                  <Icon name="download" className="h-4 w-4" /> Download QR
                </a>
                <Link href="/login" className="btn btn-outline-light w-full">
                  Sign-in page
                </Link>
              </div>
            </div>
          </section>

          <section className="relative border border-line bg-surface p-6">
            <CornerFrame size={34} inset={9} tone="ink" />
            <p className="eyebrow relative">Your record</p>
            <h2 className="relative font-display text-lg font-semibold text-ink-900">
              Registration details
            </h2>
            <dl className="relative mt-4 space-y-3 text-xs">
              {[
                ["User code", user.user_code],
                ["Name", user.name],
                ["Phone", user.phone],
                ["Division", user.division],
                ["District", user.district],
                ["Upazila", user.upazila],
                ["Union", user.union_name],
                user.institute ? ["Institute", user.institute] : null,
                user.ssc_batch ? ["Batch", user.ssc_batch] : null,
                ["Registered", user.created_at ? new Date(user.created_at).toLocaleString() : "-"],
              ]
                .filter(Boolean)
                .map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <dt className="text-muted">{label}</dt>
                    <dd className="max-w-[60%] text-right font-semibold text-ink-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <section className="relative border border-line bg-surface p-6">
            <CornerFrame size={34} inset={9} tone="gold" />
            <p className="eyebrow relative">Help &amp; support</p>
            <p className="relative text-sm text-muted">
              Having trouble with your pass or sign-in?
            </p>
            <SupportContact phone={supportPhone} className="relative mt-3 text-xs leading-5 text-body-soft" />
          </section>

          <section className="relative border border-gold/30 bg-gold-tint p-4">
            <p className="text-xs leading-6 text-gold-deep">
              <strong className="font-bold">Guidelines:</strong>{" "}
              {config?.guidelines || "Bring the printed A4 pass; photo ID may be requested; re-entry requires a new scan."}
            </p>
          </section>
        </div>
      </main>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; margin: 0 !important; border: 0 !important; box-shadow: none !important; }
          .print-ticket { width: 210mm !important; height: 297mm !important; }
        }
      `}</style>
    </div>
  );
}
