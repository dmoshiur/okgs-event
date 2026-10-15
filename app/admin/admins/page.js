"use client";

import { useEffect, useState } from "react";
import CornerFrame from "@/app/components/CornerFrame";

const EMPTY_FORM = { username: "", email: "", password: "", role: "staff" };

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

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
      setMessageType("success");
      setMessage("Administrator account created.");
      setForm(EMPTY_FORM);
      await fetchAdmins();
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
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
      setMessageType("success");
      setMessage("Administrator account updated.");
      await fetchAdmins();
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    }
  }

  async function handleDelete(admin) {
    if (String(admin.id) === String(currentAdminId)) {
      setMessageType("error");
      setMessage("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete the account for ${admin.username}?`)) return;

    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete account.");
      setMessageType("success");
      setMessage("Administrator account deleted.");
      await fetchAdmins();
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Access control</p>
      <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink-950">
        Staff accounts
      </h1>
      <p className="page-lead">
        Super-admins can create, update, and remove staff and administrator accounts.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="relative border border-line bg-surface p-6">
          <CornerFrame size={40} inset={10} tone="gold" />
          {role === "superadmin" ? (
            <>
              <p className="eyebrow relative">
                <span>Create account</span>
              </p>
              <form onSubmit={handleCreate} className="relative space-y-4">
                <label className="field" htmlFor="admin-username">
                  <span className="field-label">Username</span>
                  <input
                    id="admin-username"
                    value={form.username}
                    onChange={(event) => setForm({ ...form, username: event.target.value })}
                    required
                    minLength={3}
                    maxLength={40}
                    pattern="[a-zA-Z0-9._-]{3,40}"
                    autoComplete="username"
                    className="input"
                  />
                </label>
                <label className="field" htmlFor="admin-email">
                  <span className="field-label">Email</span>
                  <input
                    id="admin-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                    autoComplete="email"
                    className="input"
                  />
                </label>
                <label className="field" htmlFor="admin-password">
                  <span className="field-label">Initial password</span>
                  <input
                    id="admin-password"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="input"
                  />
                </label>
                <label className="field" htmlFor="admin-role">
                  <span className="field-label">Role</span>
                  <select
                    id="admin-role"
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                    className="select"
                  >
                    <option value="staff">Staff</option>
                    <option value="superadmin">Super-admin</option>
                  </select>
                </label>
                <button className="btn btn-ink w-full">Create account</button>
              </form>
            </>
          ) : (
            <>
              <p className="eyebrow relative">
                <span>Restricted</span>
              </p>
              <h2 className="relative font-display text-lg font-semibold text-ink-900">
                Super-admin access required
              </h2>
              <p className="relative mt-2 text-xs leading-5 text-muted">
                Staff can view this directory, but only a super-admin can change administrator
                access.
              </p>
            </>
          )}
        </section>

        <section className="relative border border-line bg-surface p-6">
          <CornerFrame size={40} inset={10} tone="gold" />
          <p className="eyebrow relative">
            <span>Accounts ({admins.length})</span>
          </p>
          <div className="relative max-h-[500px] space-y-3 overflow-y-auto">
            {admins.length === 0 ? (
              <p className="border border-dashed border-line-strong bg-paper-2 p-4 text-xs text-muted">
                No accounts to show.
              </p>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between gap-3 border border-line bg-paper-2 p-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 truncate text-sm font-semibold text-ink-900">
                      {admin.username}
                      {String(admin.id) === String(currentAdminId) ? (
                        <span className="tag tag-gold">you</span>
                      ) : null}
                      <span className={`tag ${admin.role === "superadmin" ? "tag-ink" : "tag-warning"}`}>
                        {admin.role}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted">{admin.email}</p>
                    <p className="mt-1 text-[10px] text-muted-2">
                      Added {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  {role === "superadmin" ? (
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => beginEdit(admin)} className="btn btn-outline btn-sm">
                        Edit
                      </button>
                      {String(admin.id) !== String(currentAdminId) ? (
                        <button onClick={() => handleDelete(admin)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {message ? (
        <p
          role="status"
          className={`alert mt-4 ${messageType === "error" ? "alert-error" : "alert-success"}`}
        >
          {message}
        </p>
      ) : null}

      {editingAdmin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-admin-title"
            className="relative w-full max-w-md border border-line-strong bg-surface-warm p-6 shadow-floated"
          >
            <CornerFrame size={40} inset={10} tone="gold" />
            <div className="relative flex items-center justify-between gap-3">
              <h2 id="edit-admin-title" className="font-display text-lg font-semibold text-ink-900">
                Edit {editingAdmin.username}
              </h2>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                aria-label="Close edit dialog"
                className="rounded-xs p-2 text-muted hover:bg-paper-2"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="relative mt-5 space-y-4">
              <input
                aria-label="Username"
                value={editingAdmin.username}
                onChange={(event) => setEditingAdmin({ ...editingAdmin, username: event.target.value })}
                required
                minLength={3}
                maxLength={40}
                pattern="[a-zA-Z0-9._-]{3,40}"
                className="input"
              />
              <input
                aria-label="Email"
                type="email"
                value={editingAdmin.email}
                onChange={(event) => setEditingAdmin({ ...editingAdmin, email: event.target.value })}
                required
                className="input"
              />
              <select
                aria-label="Role"
                value={editingAdmin.role}
                onChange={(event) => setEditingAdmin({ ...editingAdmin, role: event.target.value })}
                className="select"
              >
                <option value="staff">Staff</option>
                <option value="superadmin">Super-admin</option>
              </select>
              <label className="field" htmlFor="edit-admin-password">
                <span className="field-label">New password (optional)</span>
                <input
                  id="edit-admin-password"
                  type="password"
                  value={editingAdmin.password}
                  onChange={(event) => setEditingAdmin({ ...editingAdmin, password: event.target.value })}
                  minLength={editingAdmin.password ? 8 : undefined}
                  maxLength={72}
                  autoComplete="new-password"
                  className="input"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingAdmin(null)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button className="btn btn-ink btn-sm">Save changes</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
