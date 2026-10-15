"use client";
import { useEffect, useState } from "react";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "staff" });
  const [msg, setMsg] = useState("");

  async function fetchAdmins() {
    const res = await fetch("/api/admin/admins");
    if (res.ok) {
      const data = await res.json();
      setAdmins(data.admins);
    }
  }

  useEffect(() => { fetchAdmins(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("✅ Admin created");
      setForm({ username: "", email: "", password: "", role: "staff" });
      fetchAdmins();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this admin?")) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (res.ok) fetchAdmins();
    else {
      const data = await res.json();
      alert(data.error);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-black text-slate-900">Multi-Admin Management (RBAC)</h1>
      <p className="text-sm text-slate-500 mt-1">Super-Admin can create and manage Admin/Staff accounts. Role: superadmin or staff.</p>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Create New Admin / Staff</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input placeholder="Username *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border text-sm" />
            <input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border text-sm" />
            <input placeholder="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border text-sm" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white">
              <option value="staff">Staff</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm">Create Admin</button>
          </form>
          {msg && <p className="mt-3 text-xs">{msg}</p>}
          <p className="mt-4 text-[11px] text-slate-400">Only superadmin role can create/delete admins. Staff can scan, view users, print.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Existing Admins ({admins.length})</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {admins.map((a) => (
              <div key={a.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-sm text-slate-900">{a.username} <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${a.role === "superadmin" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>{a.role}</span></p>
                  <p className="text-xs text-slate-500">{a.email}</p>
                  <p className="text-[11px] text-slate-400">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-[11px] bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
