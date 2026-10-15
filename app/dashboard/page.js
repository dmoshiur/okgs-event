"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SupportContact from "@/app/components/SupportContact";
import { DEFAULT_SUPPORT_PHONE } from "@/lib/constants";

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
        // Fetch full user data from users endpoint? Use me data but need extra
        // We'll fetch user detail via admin? Actually me only gives limited. Fetch users via search?
        // Let's get system config and user details from db via custom endpoint: we already have me but need full
        const cfgRes = await fetch("/api/admin/config");
        if (cfgRes.ok) {
          const cfg = await cfgRes.json();
          setConfig(cfg);
        }

        // Fetch user full via direct query? We'll use attendance API and also fetch user via /api/auth/me already returns limited
        // Need to fetch attendance
        // Also fetch full user record by calling /api/admin/users search? but auth is user, not admin, so will fail.
        // Workaround: we have user id, we can fetch from /api/auth/me and we have photo etc. For other fields, we need an endpoint for user self.
        // For now, fetch user full via a new endpoint we haven't made? We'll call /api/auth/me returns what we have, but we need more.
        // We'll fetch via /api/register? no.
        // Let's create quick client fetch to get user details from localStorage? Actually after login, we can fetch from users table via a public self endpoint.
        // Simplify: call /api/auth/me and if it returns limited, we will fetch additional via a custom route /api/user/self that we will create inline? Instead, we will fetch all via /api/admin/users if admin, but user can't.
        // So for now we will use what we have and also fetch attendance logs via a user attendance endpoint we need to create.
        // We'll try to fetch /api/user/dashboard - but not exists yet. Let's make a simple fetch to /api/auth/me again and also try to get full user via server component? Workaround: use fetch to /api/admin/users/[id] will fail for user.
        // Instead, we will directly query via an endpoint we will add now: /api/user/me
        const userRes = await fetch(`/api/user/me`);
        if (userRes.ok) {
          const u = await userRes.json();
          setUser(u);
        } else {
          // fallback to meData
          setUser(meData);
        }

        const attRes = await fetch(`/api/user/attendance`);
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttendance(attData.logs || []);
        }
      } catch (e) {
        console.error(e);
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">Loading your pass...</p></div>;
  }

  if (!user) return null;

  const ticketBg = "https://i.postimg.cc/CxG99ZrK/image.png";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/login" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">OK</div>
            <span className="font-bold text-slate-900 hidden sm:inline">OKGS Genesis</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">{user.name} • {user.user_code}</span>
            <button onClick={handleLogout} className="text-xs border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left: Pass Preview */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-black text-slate-900">Your Event Pass</h1>
          <p className="text-sm text-slate-500 mt-1">Show this QR at gate. Print A4 recommended.</p>

          {/* A4 Ticket Preview */}
          <div className="print-area mt-6 bg-white rounded-[20px] border border-slate-200 shadow-xl overflow-hidden">
            {/* Ticket Header */}
            <div className="print-ticket relative h-[420px] w-full overflow-hidden bg-slate-900" style={{ backgroundImage: `url(${ticketBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-slate-900/70" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <img src={config?.school_logo_1 || "/okgs-mark.svg"} alt="Primary school logo" className="w-10 h-10 rounded-full bg-white p-1 object-cover" />
                    {config?.school_logo_2 && <img src={config.school_logo_2} alt="Secondary school logo" className="w-10 h-10 rounded-full bg-white p-1 object-cover" />}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-xs">{config?.school_name_1 || "OMAR KINDERGARTEN SCHOOL"}</p>
                    {config?.school_name_2 && <p className="text-amber-400 text-[10px]">{config.school_name_2}</p>}
                  </div>
                </div>

                <div className="flex gap-6 items-end">
                  <img src={user.photo_url} alt={user.name} className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg" />
                  <div className="bg-white p-2 rounded-xl shadow-xl">
                    <img src={user.qr_code_url} alt="QR" className="w-28 h-28" />
                  </div>
                  <div className="text-white pb-2">
                    <h3 className="font-black text-lg leading-tight">{user.name}</h3>
                    <p className="text-white/70 text-xs mt-1">{user.phone} {user.email ? `• ${user.email}` : ""}</p>
                    <p className="text-amber-400 text-xs font-bold mt-1">{user.user_code}</p>
                    <p className="text-white/50 text-[11px] mt-1">{user.division}, {user.district}, {user.upazila}, {user.union_name}</p>
                    {user.institute && <p className="text-white/50 text-[11px]">{user.institute} {user.ssc_batch ? `• Batch ${user.ssc_batch}` : ""}</p>}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-widest">Event</p>
                    <p className="text-white font-bold text-sm">{config?.event_title || "Omar Kindergarten School Event"}</p>
                    <p className="text-white/60 text-[11px]">{config?.event_date} • {config?.event_location}</p>
                  </div>
                  <p className="text-white/20 text-[10px]">A4 Ticket • 210x297mm • OKGS</p>
                </div>
              </div>
            </div>

            <div className="no-print p-4 bg-amber-50 border-t border-amber-100 flex justify-between items-center">
              <p className="text-[11px] text-amber-800">Present this QR at entry gate. Valid for single person. Non-transferable.</p>
              <button onClick={() => window.print()} className="bg-slate-900 text-white text-xs px-4 py-2 rounded-full font-bold">Print A4</button>
            </div>
          </div>

          {/* Attendance History */}
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 text-sm">Entry / Exit History</h3>
            {attendance.length === 0 ? (
              <p className="text-xs text-slate-500 mt-3">No scan logs yet. Your check-in will appear here after gate scan.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {attendance.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${log.type === "check_in" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{log.type}</span>
                    <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-slate-400 text-[11px]">by {log.scanned_by_name || "System"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[20px] p-6 text-white">
            <h4 className="font-bold">Quick Actions</h4>
            <div className="mt-4 space-y-3">
              <button onClick={() => window.print()} className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm">Print A4 Ticket</button>
              <a href={user.qr_code_url} download={`${user.user_code}-qr.png`} className="block w-full border border-white/20 text-center py-3 rounded-xl text-sm hover:bg-white/10">Download QR</a>
              <Link href="/login" className="block w-full border border-white/10 text-center py-3 rounded-xl text-sm text-white/60 hover:text-white">Sign-in page</Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="font-bold text-slate-900 text-sm">Registration Details</h4>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">User Code</dt><dd className="font-bold text-slate-900">{user.user_code}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-900">{user.name}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Phone</dt><dd className="font-medium">{user.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Division</dt><dd>{user.division}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">District</dt><dd>{user.district}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Upazila</dt><dd>{user.upazila}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Union</dt><dd>{user.union_name}</dd></div>
              {user.institute && <div className="flex justify-between"><dt className="text-slate-500">Institute</dt><dd>{user.institute}</dd></div>}
              {user.ssc_batch && <div className="flex justify-between"><dt className="text-slate-500">Batch</dt><dd>{user.ssc_batch}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Registered</dt><dd className="text-[11px]">{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</dd></div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="font-bold text-slate-900 text-sm">Help &amp; Support</h4>
            <p className="mt-2 text-xs text-slate-500">Having trouble with your pass or login?</p>
            <SupportContact
              phone={config?.support_phone || DEFAULT_SUPPORT_PHONE}
              className="mt-3 text-xs leading-5 text-slate-700"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs text-amber-800 leading-relaxed"><strong>Guidelines:</strong> {config?.guidelines || "Bring printed A4 pass, photo ID may be required, no re-entry without scan."}</p>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; z-index: 9999; left: 0; top: 0; width: 210mm; height: 297mm; margin: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
          .print-ticket { width: 210mm !important; height: 297mm !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
