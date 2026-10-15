"use client";
import { useEffect, useState } from "react";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

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

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    if (filter === "all") return true;
    return l.type === filter;
  });

  const checkInCount = logs.filter((l) => l.type === "check_in").length;
  const checkOutCount = logs.filter((l) => l.type === "check_out").length;

  const TABS = [
    { key: "all", label: "All" },
    { key: "check_in", label: "Check-in" },
    { key: "check_out", label: "Check-out" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Gate record</p>
          <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink-950">
            Attendance logs
          </h1>
          <p className="page-lead">
            {logs.length} logs • {checkInCount} check-ins • {checkOutCount} check-outs
          </p>
        </div>
        <button onClick={fetchLogs} className="btn btn-outline btn-sm">
          <Icon name="refresh" className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div role="tablist" aria-label="Filter attendance logs" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`tab ${filter === tab.key ? "tab-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative border border-line bg-surface">
        <CornerFrame size={34} inset={9} tone="gold" className="hidden sm:block" />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Type</th>
                <th>Timestamp</th>
                <th>Scanned by</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-2">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-2">
                    No logs recorded yet
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={log.photo_url}
                          alt={log.name}
                          className="h-8 w-8 rounded-xs border border-line object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold text-ink-900">{log.name}</p>
                          <p className="text-[11px] text-muted-2">{log.user_code}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`tag uppercase ${
                          log.type === "check_in" ? "tag-success" : "tag-warning"
                        }`}
                      >
                        {log.type === "check_in" ? "Check-in" : "Check-out"}
                      </span>
                    </td>
                    <td className="text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="text-xs text-muted">{log.scanned_by_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
