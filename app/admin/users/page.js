"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Add form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    division: "Rajshahi",
    district: "Joypurhat",
    upazila: "Joypurhat Sadar",
    union_name: "Amdoi",
    institute: "",
    ssc_batch: "",
    photo_url: "",
  });

  async function fetchUsers(q = search) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers("");
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowAdd(false);
      setForm({ name: "", phone: "", email: "", division: "Rajshahi", district: "Joypurhat", upazila: "Joypurhat Sadar", union_name: "Amdoi", institute: "", ssc_batch: "", photo_url: "" });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user? This will also delete attendance logs.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
    else alert("Delete failed");
  }

  async function handleEditSave() {
    if (!editUser) return;
    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editUser),
    });
    if (res.ok) {
      setEditUser(null);
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Directory</h1>
          <p className="text-sm text-slate-500">{total} attendees • Search, edit, delete, manual entry</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold">+ Manual Add</button>
          <Link href="/admin/print" className="border border-slate-200 px-4 py-2 rounded-full text-sm">Print Passes</Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, user_code, email..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
        />
        <button onClick={() => fetchUsers(search)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold">Search</button>
        <button onClick={() => { setSearch(""); fetchUsers(""); }} className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm">Clear</button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <h3 className="sm:col-span-2 font-bold text-slate-900">Manual User Entry (No password required - default 123456)</h3>
          <input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="Photo URL" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="Division" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="Upazila" value={form.upazila} onChange={(e) => setForm({ ...form, upazila: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="Union" value={form.union_name} onChange={(e) => setForm({ ...form, union_name: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="Institute" value={form.institute} onChange={(e) => setForm({ ...form, institute: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <input placeholder="SSC Batch" value={form.ssc_batch} onChange={(e) => setForm({ ...form, ssc_batch: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" />
          <button className="sm:col-span-2 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm">Create User</button>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold tracking-widest uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Code & Contact</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Institute</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.photo_url} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-bold text-slate-900">{u.user_code}</p>
                    <p className="text-xs text-slate-600">{u.phone}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {u.division}, {u.district}<br />
                    <span className="text-[11px] text-slate-400">{u.upazila}, {u.union_name}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.institute || "-"}<br />
                    <span className="text-[11px] text-slate-400">{u.ssc_batch ? `Batch ${u.ssc_batch}` : ""}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditUser(u)} className="text-[11px] border border-slate-200 px-2 py-1 rounded-full hover:bg-white">Edit</button>
                      <Link href={`/admin/print?user=${u.id}`} className="text-[11px] bg-slate-900 text-white px-2 py-1 rounded-full">Print</Link>
                      <button onClick={() => handleDelete(u.id)} className="text-[11px] bg-red-50 text-red-600 px-2 py-1 rounded-full hover:bg-red-100">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 mb-4">Edit User - {editUser.user_code}</h3>
            <div className="grid gap-3">
              <input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Name" />
              <input value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Phone" />
              <input value={editUser.email || ""} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Email" />
              <input value={editUser.division} onChange={(e) => setEditUser({ ...editUser, division: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Division" />
              <input value={editUser.district} onChange={(e) => setEditUser({ ...editUser, district: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="District" />
              <input value={editUser.upazila} onChange={(e) => setEditUser({ ...editUser, upazila: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Upazila" />
              <input value={editUser.union_name} onChange={(e) => setEditUser({ ...editUser, union_name: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Union" />
              <input value={editUser.institute || ""} onChange={(e) => setEditUser({ ...editUser, institute: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Institute" />
              <input value={editUser.ssc_batch || ""} onChange={(e) => setEditUser({ ...editUser, ssc_batch: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Batch" />
              <input value={editUser.photo_url} onChange={(e) => setEditUser({ ...editUser, photo_url: e.target.value })} className="px-4 py-2.5 rounded-xl border text-sm" placeholder="Photo URL" />
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleEditSave} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm">Save</button>
              <button onClick={() => setEditUser(null)} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
