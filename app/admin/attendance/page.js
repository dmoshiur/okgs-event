"use client";
import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/attendance?limit=200");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter((l) => {
    if (filter === "all") return true;
    return l.type === filter;
  });

  const checkInCount = logs.filter((l) => l.type === "check_in").length;
  const checkOutCount = logs.filter((l) => l.type === "check_out").length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Attendance Logs</h1>
          <p className="text-sm text-slate-500">{logs.length} logs • {checkInCount} check-ins • {checkOutCount} check-outs</p>
        </div>
        <button onClick={fetchLogs} className="border border-slate-200 px-4 py-2 rounded-full text-sm">Refresh</button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-xs font-bold ${filter === "all" ? "bg-slate-900 text-white" : "bg-white border border-slate-200"}`}>All</button>
        <button onClick={() => setFilter("check_in")} className={`px-4 py-2 rounded-full text-xs font-bold ${filter === "check_in" ? "bg-emerald-600 text-white" : "bg-white border border-slate-200"}`}>Check-In</button>
        <button onClick={() => setFilter("check_out")} className={`px-4 py-2 rounded-full text-xs font-bold ${filter === "check_out" ? "bg-orange-600 text-white" : "bg-white border border-slate-200"}`}>Check-Out</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold tracking-widest uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Scanned By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No logs</td></tr>
              ) : filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={log.photo_url} alt={log.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-slate-900 text-xs">{log.name}</p>
                        <p className="text-[11px] text-slate-500">{log.user_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${log.type === "check_in" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{log.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{log.scanned_by_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
