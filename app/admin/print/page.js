"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PrintPage() {
  const searchParams = useSearchParams();
  const userIdQuery = searchParams.get("user");
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const bgTemplate = "https://i.postimg.cc/CxG99ZrK/image.png";

  async function fetchData(q = "") {
    setLoading(true);
    try {
      const cfgRes = await fetch("/api/admin/config");
      if (cfgRes.ok) setConfig(await cfgRes.json());

      const usersRes = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&limit=100`);
      if (usersRes.ok) {
        const data = await usersRes.json();
        let list = data.users;
        if (userIdQuery) {
          const single = list.find((u) => String(u.id) === String(userIdQuery));
          if (single) {
            list = [single];
            setSelected([single.id]);
          }
        }
        setUsers(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData("");
  }, [userIdQuery]);

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
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900">A4 Ticket Print Engine</h1>
          <p className="text-sm text-slate-500">Background: {bgTemplate} • Size A4 portrait 210x297mm • @media print</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} disabled={selectedUsers.length === 0} className="bg-slate-900 disabled:opacity-30 text-white px-5 py-2.5 rounded-full text-sm font-bold">Print {selectedUsers.length} Passes 🖨️</button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-center no-print">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search to filter users for batch print..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
        />
        <button onClick={() => fetchData(search)} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm">Search</button>
        <button onClick={selectAll} className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm">{selected.length === users.length ? "Deselect All" : "Select All"}</button>
        <span className="text-xs text-slate-500">{selected.length} selected / {users.length} shown</span>
      </div>

      {/* Selection List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 max-h-[300px] overflow-y-auto no-print">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? <p className="text-xs text-slate-400">Loading...</p> : users.map((u) => (
            <label key={u.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selected.includes(u.id) ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 hover:bg-white"}`}>
              <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} className="rounded" />
              <img src={u.photo_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${selected.includes(u.id) ? "text-white" : "text-slate-900"}`}>{u.name}</p>
                <p className={`text-[10px] truncate ${selected.includes(u.id) ? "text-white/60" : "text-slate-500"}`}>{u.user_code}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Print Area */}
      <div className="print-area">
        {selectedUsers.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl no-print">
            <p className="text-slate-400 text-sm">Select users above to generate A4 tickets. Each ticket uses background template stretched to A4 with overlay.</p>
          </div>
        ) : (
          selectedUsers.map((user) => (
            <div key={user.id} className="a4-page relative bg-white overflow-hidden print-break" style={{ width: "210mm", height: "297mm", margin: "0 auto 20px", position: "relative" }}>
              {/* Background Template */}
              <img src={bgTemplate} alt="Ticket BG" className="absolute inset-0 w-full h-full object-cover" style={{ width: "210mm", height: "297mm" }} />
              <div className="absolute inset-0 bg-black/40" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-[12mm] flex flex-col justify-between text-white">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={config?.school_logo_1 || "https://via.placeholder.com/60"} alt="Logo1" className="w-[14mm] h-[14mm] rounded-full bg-white p-1 object-cover" />
                    <div>
                      <p className="font-black text-[4mm] leading-tight">{config?.school_name_1 || "OKGS High School"}</p>
                      <p className="text-[3mm] text-white/70">{config?.school_name_2 || "Genesis Academy"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[3.5mm] font-bold tracking-widest uppercase text-amber-400">{config?.event_title || "Genesis Grand Reunion 2026"}</p>
                    <p className="text-[2.8mm] text-white/60">{config?.event_date} • {config?.event_location}</p>
                  </div>
                </div>

                {/* Center QR + Photo */}
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="relative">
                    <div className="bg-white p-[4mm] rounded-[4mm] shadow-2xl">
                      <img src={user.qr_code_url} alt="QR" className="w-[45mm] h-[45mm]" />
                      {/* Photo embedded inside QR center */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12mm] h-[12mm] rounded-full border-[1mm] border-white overflow-hidden bg-white shadow-lg">
                        <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-[6mm] text-center">
                    <h2 className="font-black text-[6mm] tracking-tight">{user.name}</h2>
                    <p className="text-[3.5mm] text-white/80 mt-1">{user.phone} {user.email ? `• ${user.email}` : ""}</p>
                    <p className="text-[4mm] font-bold text-amber-400 mt-1 tracking-widest">{user.user_code}</p>
                    <p className="text-[3mm] text-white/50 mt-2 max-w-[80mm] leading-tight">
                      {user.division}, {user.district}, {user.upazila}, {user.union_name} • {user.institute || ""} {user.ssc_batch ? `• Batch ${user.ssc_batch}` : ""}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end border-t border-white/10 pt-[4mm]">
                  <div>
                    <p className="text-[2.5mm] uppercase tracking-widest text-white/40">Attendee Pass • Non-transferable • Valid for 1 person</p>
                    <p className="text-[2.5mm] text-white/30 mt-1">Generated: {new Date().toLocaleString()} • OKGS Genesis Platform • Turso DB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[2.5mm] text-white/40">Scan at gate</p>
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
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            border-radius: 4mm;
          }
        }
      `}</style>
    </div>
  );
}
