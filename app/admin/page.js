"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, today: 0, check_ins: 0, admins: 0 });
  const [config, setConfig] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const cfgRes = await fetch("/api/admin/config");
        if (cfgRes.ok) setConfig(await cfgRes.json());

        const usersRes = await fetch("/api/admin/users?limit=5");
        if (usersRes.ok) {
          const data = await usersRes.json();
          setRecentUsers(data.users || []);
          setStats((s) => ({ ...s, total: data.total }));
        }

        const logsRes = await fetch("/api/admin/attendance?limit=5");
        if (logsRes.ok) {
          const data = await logsRes.json();
          setRecentLogs(data.logs || []);
          const checkIns = data.logs.filter(l => l.type === "check_in").length;
          setStats((s) => ({ ...s, check_ins: checkIns }));
        }

        const adminsRes = await fetch("/api/admin/admins");
        if (adminsRes.ok) {
          const data = await adminsRes.json();
          setStats((s) => ({ ...s, admins: data.admins?.length || 0 }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">OKGS Genesis Platform • Event Management & Attendance</p>
        </div>
        <Link href="/admin/scan" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold">Open Scanner 📷</Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Total Attendees</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.total}</p>
          <p className="text-xs text-emerald-600 mt-1">↑ Registered via /register & manual</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 text-white">
          <p className="text-[11px] font-bold tracking-widest uppercase text-white/50">Check-Ins Today</p>
          <p className="text-3xl font-black mt-2">{stats.check_ins}</p>
          <p className="text-xs text-white/50 mt-1">Live entry logs</p>
        </div>
        <div className="bg-amber-400 rounded-2xl p-5">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-900/60">Event</p>
          <p className="text-sm font-black text-slate-900 mt-2 leading-tight">{config?.event_title || "OKGS Genesis"}</p>
          <p className="text-xs text-slate-900/70 mt-1">{config?.event_date}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Admins / Staff</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.admins}</p>
          <p className="text-xs text-slate-500 mt-1">RBAC managed</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">Recent Registrations</h3>
            <Link href="/admin/users" className="text-xs text-slate-500 hover:text-slate-900">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? <p className="text-xs text-slate-400">No users yet</p> : recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                <img src={u.photo_url} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-500">{u.user_code} • {u.phone}</p>
                </div>
                <span className="text-[11px] text-slate-400">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">Live Attendance Feed</h3>
            <Link href="/admin/attendance" className="text-xs text-slate-500 hover:text-slate-900">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentLogs.length === 0 ? <p className="text-xs text-slate-400">No scans yet</p> : recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                <img src={log.photo_url} alt={log.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{log.name} <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${log.type === "check_in" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{log.type}</span></p>
                  <p className="text-[11px] text-slate-500">{log.user_code} • {new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3">👥</div>
          <h4 className="font-bold text-slate-900 text-sm">User Directory</h4>
          <p className="text-xs text-slate-500 mt-1">View, search, edit, delete attendees. Manual entry without password.</p>
        </Link>
        <Link href="/admin/print" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center mb-3">🖨️</div>
          <h4 className="font-bold text-slate-900 text-sm">Print A4 Passes</h4>
          <p className="text-xs text-slate-500 mt-1">Batch / Individual A4 ticket printing with background template.</p>
        </Link>
        <Link href="/admin/settings" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">⚙️</div>
          <h4 className="font-bold text-slate-900 text-sm">Branding & Config</h4>
          <p className="text-xs text-slate-500 mt-1">Update logos, school names, event title, notice, guidelines.</p>
        </Link>
      </div>
    </div>
  );
}
