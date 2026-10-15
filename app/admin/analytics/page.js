"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

function percent(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export default function BatchAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!res.ok) throw new Error("analytics");
      setData(await res.json());
      setError("");
    } catch {
      setError("Batch analytics could not be loaded. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const batches = data?.batches || [];
  const totals = data?.totals || { registered: 0, admitted: 0, inside: 0, exited: 0 };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">SSC batch distribution</p>
          <h1 className="font-display text-[clamp(2rem,4vw,2.9rem)] font-semibold leading-tight tracking-tight text-ink-950">
            Batch Analytics
          </h1>
          <p className="page-lead">
            How registered attendees are spread across SSC batches, and how each batch is moving through the gate.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn btn-outline btn-sm">
          <Icon name="refresh" className="h-4 w-4" /> {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Registered", totals.registered],
          ["Admitted at gate", totals.admitted],
          ["Inside now", totals.inside],
          ["Exited", totals.exited],
        ].map(([label, value]) => (
          <section key={label} className="stat-card">
            <CornerFrame size={28} inset={9} tone="gold" />
            <p className="stat-label relative">{label}</p>
            <p className="stat-value relative">{value.toLocaleString("en-US")}</p>
          </section>
        ))}
      </div>

      <section className="relative border border-line bg-surface p-5 sm:p-6">
        <CornerFrame size={40} inset={10} tone="gold" className="hidden sm:block" />
        <div className="relative mb-4">
          <p className="eyebrow">By batch</p>
          <h2 className="font-display text-2xl font-semibold text-ink-950">Batch-wise breakdown</h2>
        </div>

        {batches.length === 0 && !loading ? (
          <p className="border border-dashed border-line-strong p-6 text-center text-sm text-muted">
            No attendees registered yet. Batches appear here as registrations arrive.
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch / SSC year</th>
                  <th>Registered</th>
                  <th>Admitted</th>
                  <th>Inside</th>
                  <th>Exited</th>
                  <th>Share of registrations</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((row) => (
                  <tr key={row.batch}>
                    <td className="font-semibold">{row.batch}</td>
                    <td>{row.registered.toLocaleString("en-US")}</td>
                    <td>{row.admitted.toLocaleString("en-US")}</td>
                    <td>{row.inside.toLocaleString("en-US")}</td>
                    <td>{row.exited.toLocaleString("en-US")}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="meter min-w-[100px] flex-1"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={percent(row.registered, totals.registered)}
                          aria-label={`${row.batch} share of registrations`}
                        >
                          <i style={{ width: `${percent(row.registered, totals.registered)}%` }} />
                        </div>
                        <span className="w-10 text-right text-xs text-muted">
                          {percent(row.registered, totals.registered)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-sm text-muted">
        Need the individual attendee list? <Link href="/admin/users" className="link-underline text-ink-900">Open Users</Link>.
      </p>
    </div>
  );
}
