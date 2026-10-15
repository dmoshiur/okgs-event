"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    school_name_1: "",
    school_name_2: "",
    school_logo_1: "",
    school_logo_2: "",
    event_title: "",
    event_description: "",
    event_date: "",
    event_location: "",
    notice_board: "",
    guidelines: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setForm({
              school_name_1: data.school_name_1 || "",
              school_name_2: data.school_name_2 || "",
              school_logo_1: data.school_logo_1 || "",
              school_logo_2: data.school_logo_2 || "",
              event_title: data.event_title || "",
              event_description: data.event_description || "",
              event_date: data.event_date || "",
              event_location: data.event_location || "",
              notice_board: data.notice_board || "",
              guidelines: data.guidelines || "",
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("✅ Settings updated successfully! Landing page will reflect instantly.");
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogoUpload(e, field) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "okgs/branding");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm({ ...form, [field]: data.url });
      } else {
        // fallback to base64 preview
        const reader = new FileReader();
        reader.onload = () => setForm((f) => ({ ...f, [field]: reader.result }));
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => setForm((f) => ({ ...f, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  }

  if (loading) return <div className="text-slate-500">Loading config...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black text-slate-900">System & Branding Settings</h1>
      <p className="text-sm text-slate-500 mt-1">Dynamic Admin Config: Logos (2), School Names (2), Event Banner, Notice, Guidelines, Print layouts</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 grid sm:grid-cols-2 gap-4">
          <h3 className="sm:col-span-2 font-bold text-slate-900 text-sm">🏫 School Branding (Dynamic)</h3>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Primary School Name *</label>
            <input name="school_name_1" value={form.school_name_1} onChange={handleChange} required className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Secondary School Name</label>
            <input name="school_name_2" value={form.school_name_2} onChange={handleChange} className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Primary Logo URL *</label>
            <input name="school_logo_1" value={form.school_logo_1} onChange={handleChange} required className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="https://..." />
            <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, "school_logo_1")} className="mt-2 text-xs" />
            {form.school_logo_1 && <img src={form.school_logo_1} alt="Logo1" className="mt-2 w-12 h-12 rounded-full object-cover border" />}
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Secondary Logo URL</label>
            <input name="school_logo_2" value={form.school_logo_2} onChange={handleChange} className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="https://..." />
            <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, "school_logo_2")} className="mt-2 text-xs" />
            {form.school_logo_2 && <img src={form.school_logo_2} alt="Logo2" className="mt-2 w-12 h-12 rounded-full object-cover border" />}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 grid gap-4">
          <h3 className="font-bold text-slate-900 text-sm">🎉 Event Configuration</h3>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Event Title *</label>
            <input name="event_title" value={form.event_title} onChange={handleChange} required className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Event Description</label>
            <textarea name="event_description" value={form.event_description} onChange={handleChange} rows={3} className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Event Date</label>
              <input name="event_date" value={form.event_date} onChange={handleChange} className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="December 25, 2026" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Event Location</label>
              <input name="event_location" value={form.event_location} onChange={handleChange} className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="OKGS Campus, Joypurhat" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Notice Board</label>
            <textarea name="notice_board" value={form.notice_board} onChange={handleChange} rows={2} className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Guidelines</label>
            <textarea name="guidelines" value={form.guidelines} onChange={handleChange} rows={3} className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
        </div>

        {msg && <div className={`p-3 rounded-xl text-sm ${msg.startsWith("✅") ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"}`}>{msg}</div>}

        <button disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm">
          {saving ? "Saving..." : "Save Configuration →"}
        </button>

        <p className="text-[11px] text-slate-400 text-center">Changes reflect instantly on landing page (/), navbar logos, footer, and A4 print header.</p>
      </form>
    </div>
  );
}
