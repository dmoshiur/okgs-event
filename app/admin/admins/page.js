"use client";

import { useEffect, useState } from "react";

const EMPTY_FORM = { username: "", email: "", password: "", role: "staff" };

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [message, setMessage] = useState("");

  async function fetchAdmins() {
    const response = await fetch("/api/admin/admins", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setAdmins(data.admins || []);
  }

  useEffect(() => {
    fetchAdmins().catch(() => {});
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        setRole(data?.role || "");
        setCurrentAdminId(data?.id ?? null);
      })
      .catch(() => {});
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create account.");
      setMessage("✅ Administrator account created.");
      setForm(EMPTY_FORM);
      await fetchAdmins();
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  }

  function beginEdit(admin) {
    setMessage("");
    setEditingAdmin({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      password: "",
    });
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (!editingAdmin) return;
    setMessage("");
    const changes = {
      username: editingAdmin.username,
      email: editingAdmin.email,
      role: editingAdmin.role,
    };
    if (editingAdmin.password) changes.password = editingAdmin.password;

    try {
      const response = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update account.");
      setEditingAdmin(null);
      setMessage("✅ Administrator account updated.");
      await fetchAdmins();
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  }

  async function handleDelete(admin) {
    if (String(admin.id) === String(currentAdminId)) {
      setMessage("❌ You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete the account for ${admin.username}?`)) return;

    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete account.");
      setMessage("✅ Administrator account deleted.");
      await fetchAdmins();
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-black text-slate-900">Administrator management</h1>
      <p className="mt-1 text-sm text-slate-500">
        Super-admins can create, update, and remove staff and administrator accounts.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          {role === "superadmin" ? (
            <>
              <h2 className="mb-4 text-sm font-bold text-slate-900">Create an administrator</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label htmlFor="admin-username" className="text-xs font-semibold text-slate-600">Username</label>
                  <input
                    id="admin-username"
                    value={form.username}
                    onChange={(event) => setForm({ ...form, username: event.target.value })}
                    required
                    minLength={3}
                    maxLength={40}
                    pattern="[a-zA-Z0-9._-]{3,40}"
                    autoComplete="username"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="admin-email" className="text-xs font-semibold text-slate-600">Email</label>
                  <input
                    id="admin-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                    autoComplete="email"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="admin-password" className="text-xs font-semibold text-slate-600">Initial password</label>
                  <input
                    id="admin-password"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="admin-role" className="text-xs font-semibold text-slate-600">Role</label>
                  <select
                    id="admin-role"
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="staff">Staff</option>
                    <option value="superadmin">Super-admin</option>
                  </select>
                </div>
                <button className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-slate-800">
                  Create account
                </button>
              </form>
            </>
          ) : (
            <div>
              <h2 className="text-sm font-bold text-slate-900">Super-admin access required</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Staff can view this directory, but only a super-admin can change administrator access.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Accounts ({admins.length})</h2>
          <div className="max-h-[500px] space-y-3 overflow-y-auto">
            {admins.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No accounts to show.</p>
            ) : admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {admin.username}
                    {String(admin.id) === String(currentAdminId) ? <span className="ml-2 text-[10px] font-medium text-slate-400">you</span> : null}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${admin.role === "superadmin" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>
                      {admin.role}
                    </span>
                  </p>
                  <p className="truncate text-xs text-slate-500">{admin.email}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Added {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                {role === "superadmin" ? (
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => beginEdit(admin)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-400">
                      Edit
                    </button>
                    {String(admin.id) !== String(currentAdminId) ? (
                      <button onClick={() => handleDelete(admin)} className="rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100">
                        Delete
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>

      {message ? (
        <p role="status" className={`mt-4 rounded-xl p-3 text-xs ${message.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {message}
        </p>
      ) : null}

      {editingAdmin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="edit-admin-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 id="edit-admin-title" className="font-bold text-slate-900">Edit {editingAdmin.username}</h2>
              <button onClick={() => setEditingAdmin(null)} aria-label="Close edit dialog" className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="mt-5 space-y-4">
              <input
                aria-label="Username"
                value={editingAdmin.username}
                onChange={(event) => setEditingAdmin({ ...editingAdmin, username: event.target.value })}
                required
                minLength={3}
                maxLength={40}
                pattern="[a-zA-Z0-9._-]{3,40}"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
              <input
                aria-label="Email"
                type="email"
                value={editingAdmin.email}
                onChange={(event) => setEditingAdmin({ ...editingAdmin, email: event.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
              <select
                aria-label="Role"
                value={editingAdmin.role}
                onChange={(event) => setEditingAdmin({ ...editingAdmin, role: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="staff">Staff</option>
                <option value="superadmin">Super-admin</option>
              </select>
              <div>
                <label htmlFor="edit-admin-password" className="text-xs text-slate-500">New password (optional)</label>
                <input
                  id="edit-admin-password"
                  type="password"
                  value={editingAdmin.password}
                  onChange={(event) => setEditingAdmin({ ...editingAdmin, password: event.target.value })}
                  minLength={editingAdmin.password ? 8 : undefined}
                  maxLength={72}
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingAdmin(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700">Cancel</button>
                <button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Save changes</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
