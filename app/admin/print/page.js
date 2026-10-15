"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";
import { DEFAULT_SCHOOL_NAME, SCHOOL_LOGO_URL, TICKET_BACKGROUND_URL } from "@/lib/constants";

export default function PrintPage() {
  const searchParams = useSearchParams();
  const userIdQuery = searchParams.get("user");
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const bgTemplate = TICKET_BACKGROUND_URL;

  const fetchData = useCallback(
    async (q = "") => {
      setLoading(true);
      try {
        const cfgRes = await fetch("/api/admin/config");
        if (cfgRes.ok) setConfig(await cfgRes.json());

        if (userIdQuery) {
          const singleRes = await fetch(`/api/admin/users/${encodeURIComponent(userIdQuery)}`);
          if (singleRes.ok) {
            const single = await singleRes.json();
            setUsers([single]);
            setSelected([single.id]);
          } else {
            setUsers([]);
            setSelected([]);
          }
        } else {
          const usersRes = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&limit=100`);
          if (usersRes.ok) {
            const data = await usersRes.json();
            setUsers(data.users || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [userIdQuery]
  );

  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    if (selected.length === users.length) setSelected([]);
    else setSelected(users.map((u) => u.id));
  }

  const selectedUsers = users.filter((u) => selected.includes(u.id));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <p className="eyebrow">A4 print engine</p>
          <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink-950">
            Pass &amp; ticket printing
          </h1>
          <p className="page-lead">
            A4 portrait, 210 × 297 mm, zero page margin, with the school template as the sheet
            background and the QR, photo, name, and phone overlaid on top.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={selectedUsers.length === 0}
          className="btn btn-ink"
        >
          <Icon name="print" className="h-4 w-4" /> Print {selectedUsers.length} pass
          {selectedUsers.length === 1 ? "" : "es"}
        </button>
      </div>

      {/* Controls */}
      <div className="relative mb-6 flex flex-wrap items-center gap-3 border border-line bg-surface p-4 no-print">
        <CornerFrame size={30} inset={8} tone="gold" />
        <div className="relative min-w-[200px] flex-1">
          <span className="field-icon">
            <Icon name="search" className="h-5 w-5" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData(search)}
            placeholder="Search attendees for a batch print…"
            className="input input-icon"
          />
        </div>
        <button onClick={() => fetchData(search)} className="btn btn-ink btn-sm relative">
          Search
        </button>
        <button onClick={selectAll} className="btn btn-outline btn-sm relative">
          {selected.length === users.length && users.length > 0 ? "Deselect all" : "Select all"}
        </button>
        <span className="relative text-xs text-muted">
          {selected.length} selected / {users.length} shown
        </span>
      </div>

      {/* Selection list */}
      <div className="no-print mb-8 max-h-[320px] overflow-y-auto border border-line bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-xs text-muted-2">Loading…</p>
          ) : (
            users.map((u) => (
              <label
                key={u.id}
                className={`flex cursor-pointer items-center gap-3 border p-3 transition ${
                  selected.includes(u.id)
                    ? "border-ink-900 bg-ink-950 text-white"
                    : "border-line bg-paper-2 hover:border-gold"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(u.id)}
                  onChange={() => toggleSelect(u.id)}
                  className="accent-gold"
                />
                <img
                  src={u.photo_url}
                  alt={u.name}
                  className="h-8 w-8 rounded-xs border border-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs font-semibold ${
                      selected.includes(u.id) ? "text-[#f5efe1]" : "text-ink-900"
                    }`}
                  >
                    {u.name}
                  </p>
                  <p
                    className={`truncate text-[10px] ${
                      selected.includes(u.id) ? "text-white/60" : "text-muted"
                    }`}
                  >
                    {u.user_code}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Print area */}
      <div className="print-area">
        {selectedUsers.length === 0 ? (
          <div className="no-print border border-dashed border-line-strong py-20 text-center">
            <p className="text-sm text-muted">
              Select attendees above to generate A4 passes. Each sheet uses the school template as its
              background with the pass details overlaid.
            </p>
          </div>
        ) : (
          selectedUsers.map((user) => (
            <div
              key={user.id}
              className="a4-page print-break relative overflow-hidden bg-ink-950"
              style={{ width: "210mm", height: "297mm", margin: "0 auto 20px", position: "relative" }}
            >
              {/* Background template */}
              <img
                src={bgTemplate}
                alt="Ticket background template"
                className="absolute inset-0 h-full w-full object-fill"
                style={{ width: "210mm", height: "297mm" }}
              />
              <div className="absolute inset-0 bg-ink-950/45" />

              {/* 90-degree framing on the printed sheet */}
              <CornerFrame
                size={"34mm"}
                inset={"8mm"}
                thickness={"0.6mm"}
                tone="gold-soft"
                className="corner-frame--print"
              />

              {/* Content overlay */}
              <div
                className="absolute inset-0 flex flex-col justify-between text-white"
                style={{ padding: "12mm" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={config?.school_logo_1 || SCHOOL_LOGO_URL}
                      alt="Primary school logo"
                      className="h-[14mm] w-[14mm] border border-white/20 bg-white object-contain p-[1mm]"
                    />
                    {config?.school_logo_2 ? (
                      <img
                        src={config.school_logo_2}
                        alt="Secondary school logo"
                        className="h-[14mm] w-[14mm] border border-white/20 bg-white object-contain p-[1mm]"
                      />
                    ) : null}
                    <div>
                      <p className="font-display text-[4mm] font-semibold leading-tight">
                        {config?.school_name_1 || DEFAULT_SCHOOL_NAME}
                      </p>
                      {config?.school_name_2 ? (
                        <p className="text-[3mm] text-white/70">{config.school_name_2}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[3.5mm] font-bold uppercase tracking-[0.18em] text-gold-soft">
                      {config?.event_title || "Omar Kindergarten School Event"}
                    </p>
                    <p className="text-[2.8mm] text-white/60">
                      {config?.event_date} {config?.event_location ? `• ${config.event_location}` : ""}
                    </p>
                  </div>
                </div>

                {/* Centre QR + photo */}
                <div className="flex flex-1 flex-col items-center justify-center">
                  <div className="relative">
                    <div className="border-[1mm] border-white/25 bg-white p-[4mm] shadow-floated">
                      <img src={user.qr_code_url} alt="QR pass" className="h-[45mm] w-[45mm]" />
                      <div className="absolute left-1/2 top-1/2 h-[12mm] w-[12mm] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[1mm] border-white bg-white">
                        <img src={user.photo_url} alt={user.name} className="h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-[6mm] text-center">
                    <h2 className="font-display text-[6mm] font-semibold tracking-tight text-white">
                      {user.name}
                    </h2>
                    <p className="mt-[1mm] text-[3.5mm] text-white/80">
                      {user.phone} {user.email ? `• ${user.email}` : ""}
                    </p>
                    <p className="mt-[1mm] font-mono text-[4mm] font-bold tracking-[0.14em] text-gold-soft">
                      {user.user_code}
                    </p>
                    <p className="mt-[1.5mm] text-[3.6mm] font-semibold text-gold-soft">
                      Batch: {user.ssc_batch || "—"}
                    </p>
                    <p className="mt-[2mm] max-w-[80mm] text-[3mm] leading-tight text-white/50">
                      {user.institute ? `${user.institute} • ` : ""}
                      {user.division}, {user.district}, {user.upazila}, {user.union_name}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between border-t border-white/15 pt-[4mm]">
                  <div>
                    <p className="text-[2.5mm] uppercase tracking-[0.2em] text-white/45">
                      Attendee pass • non-transferable • valid for one person
                    </p>
                    <p className="mt-[1mm] text-[2.5mm] text-white/35">
                      Generated {new Date().toLocaleString()} • OKGS event platform • Turso DB
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[2.5mm] text-white/45">Scan at gate</p>
                    <p className="text-[3mm] font-bold">OKGS • {user.user_code}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white; }
          .no-print { display: none !important; }
          .print-area { display: block !important; }
          .a4-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            page-break-after: always;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-break { page-break-after: always; }
        }
        @media screen {
          .a4-page {
            box-shadow: 0 20px 60px rgba(5,13,24,0.25);
            border: 1px solid #d5cebe;
          }
        }
      `}</style>
    </div>
  );
}
