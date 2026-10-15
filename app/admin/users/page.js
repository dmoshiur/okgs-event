"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

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
    union_name: "Amdai",
    institute: "",
    ssc_batch: "",
    photo_url: "",
  });

  const fetchUsers = useCallback(async (q = "") => {
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
  }, []);

  useEffect(() => {
    fetchUsers("");
  }, [fetchUsers]);

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
      setForm({
        name: "",
        phone: "",
        email: "",
        division: "Rajshahi",
        district: "Joypurhat",
        upazila: "Joypurhat Sadar",
        union_name: "Amdai",
        institute: "",
        ssc_batch: "",
        photo_url: "",
      });
      fetchUsers(search);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user? This will also delete attendance logs.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers(search);
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
      fetchUsers(search);
    } else {
      const data = await res.json();
      alert(data.error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Attendee directory</p>
          <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink-950">
            Students
          </h1>
          <p className="page-lead">{total} attendees • search, edit, delete, or add a manual entry.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-ink btn-sm">
            <Icon name="plus" className="h-4 w-4" /> Manual add
          </button>
          <Link href="/admin/print" className="btn btn-outline btn-sm">
            <Icon name="print" className="h-4 w-4" /> Print passes
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-wrap gap-3 border border-line bg-surface p-4">
        <div className="relative min-w-[220px] flex-1">
          <span className="field-icon">
            <Icon name="search" className="h-5 w-5" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers(search)}
            placeholder="Search name, phone, user code, or email…"
            className="input input-icon"
          />
        </div>
        <button onClick={() => fetchUsers(search)} className="btn btn-ink btn-sm">
          Search
        </button>
        <button
          onClick={() => {
            setSearch("");
            fetchUsers("");
          }}
          className="btn btn-outline btn-sm"
        >
          Clear
        </button>
      </div>

      {/* Add form */}
      {showAdd ? (
        <form
          onSubmit={handleAdd}
          className="relative mb-6 grid gap-4 border border-gold/30 bg-gold-tint p-6 sm:grid-cols-2"
        >
          <CornerFrame size={40} inset={10} tone="gold" />
          <h3 className="relative font-display text-[1.05rem] font-semibold text-ink-900 sm:col-span-2">
            Manual attendee entry (no password required)
          </h3>
          {[
            ["name", "Full name *", true],
            ["phone", "Phone *", true],
            ["email", "Email"],
            ["photo_url", "Photo URL"],
            ["division", "Division"],
            ["district", "District"],
            ["upazila", "Upazila"],
            ["union_name", "Union"],
            ["institute", "Institute"],
            ["ssc_batch", "SSC batch"],
          ].map(([key, placeholder, required]) => (
            <input
              key={key}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={Boolean(required)}
              className="input relative bg-surface"
            />
          ))}
          <button className="btn btn-ink btn-sm relative sm:col-span-2">Create attendee</button>
        </form>
      ) : null}

      {/* Table */}
      <div className="border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Code &amp; contact</th>
                <th>Address</th>
                <th>Institute</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-2">
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-2">
                    No attendees found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={u.photo_url}
                          alt={u.name}
                          className="h-9 w-9 rounded-xs border border-line object-cover"
                        />
                        <div>
                          <p className="font-semibold text-ink-900">{u.name}</p>
                          <p className="text-[11px] text-muted-2">
                            {new Date(u.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-mono text-xs font-bold tracking-wide text-ink-900">{u.user_code}</p>
                      <p className="text-xs text-body-soft">{u.phone}</p>
                      <p className="text-[11px] text-muted-2">{u.email}</p>
                    </td>
                    <td className="text-xs">
                      {u.division}, {u.district}
                      <br />
                      <span className="text-[11px] text-muted-2">
                        {u.upazila}, {u.union_name}
                      </span>
                    </td>
                    <td className="text-xs">
                      {u.institute || "-"}
                      <br />
                      <span className="text-[11px] text-muted-2">
                        {u.ssc_batch ? `Batch ${u.ssc_batch}` : ""}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditUser(u)} className="btn btn-outline btn-sm">
                          Edit
                        </button>
                        <Link href={`/admin/print?user=${u.id}`} className="btn btn-ink btn-sm">
                          Print
                        </Link>
                        <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-line-strong bg-surface-warm p-6">
            <CornerFrame size={44} inset={10} tone="gold" />
            <p className="eyebrow relative">
              <span>Edit attendee</span>
            </p>
            <h3 className="relative font-display text-lg font-semibold text-ink-900">
              {editUser.user_code}
            </h3>
            <div className="relative mt-5 grid gap-3">
              {[
                ["name", "Name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["division", "Division"],
                ["district", "District"],
                ["upazila", "Upazila"],
                ["union_name", "Union"],
                ["institute", "Institute"],
                ["ssc_batch", "Batch"],
                ["photo_url", "Photo URL"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  value={editUser[key] || ""}
                  onChange={(e) => setEditUser({ ...editUser, [key]: e.target.value })}
                  className="input"
                  placeholder={placeholder}
                />
              ))}
            </div>
            <div className="relative mt-6 flex gap-2">
              <button onClick={handleEditSave} className="btn btn-ink flex-1">
                Save
              </button>
              <button onClick={() => setEditUser(null)} className="btn btn-outline flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
