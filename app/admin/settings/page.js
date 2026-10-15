"use client";
import { useEffect, useState } from "react";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

const EMPTY_CONFIG = {
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
  support_phone: "",
};

export default function SettingsPage() {
  const [form, setForm] = useState(EMPTY_CONFIG);
  const [themePreset, setThemePreset] = useState("thinktank-academia");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

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
              support_phone: data.support_phone || "",
            });
            setThemePreset(data.theme_preset || "thinktank-academia");
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
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({
        type: "success",
        text: "Settings updated. The sign-in portal, registration, and new passes now use this branding.",
      });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogoUpload(e, field) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMsg({ type: "error", text: "Choose a JPEG, PNG, or WebP logo under 5 MB." });
      input.value = "";
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "okgs/branding");
    setUploadingLogo(field);
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Logo upload failed.");
      setForm((current) => ({ ...current, [field]: data.url }));
      setMsg({ type: "success", text: "Logo uploaded to Cloudinary. Save the configuration to publish it." });
    } catch (error) {
      setMsg({ type: "error", text: error.message });
    } finally {
      setUploadingLogo("");
      input.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted">
        <span className="h-5 w-5 animate-spin rounded-full border border-line-strong border-t-gold" />
        Loading configuration…
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <p className="eyebrow">System configuration</p>
      <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink-950">
        Branding &amp; event settings
      </h1>
      <p className="page-lead">
        Manage school logos and names, the active event details, notices, guidelines, and ticket
        branding.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="relative border border-line bg-surface p-6">
          <CornerFrame size={44} inset={10} tone="gold" />
          <p className="eyebrow relative">
            <span>School branding (dynamic)</span>
          </p>
          <div className="relative grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span className="field-label">Primary school name *</span>
              <input
                name="school_name_1"
                value={form.school_name_1}
                onChange={handleChange}
                required
                className="input"
              />
            </label>
            <label className="field">
              <span className="field-label">Secondary school name</span>
              <input name="school_name_2" value={form.school_name_2} onChange={handleChange} className="input" />
            </label>

            {["school_logo_1", "school_logo_2"].map((field, index) => (
              <div key={field} className="field">
                <label className="field-label" htmlFor={field}>
                  {index === 0 ? "Primary logo URL *" : "Secondary logo URL"}
                </label>
                <input
                  id={field}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required={index === 0}
                  className="input"
                  placeholder="https://…"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleLogoUpload(e, field)}
                  disabled={Boolean(uploadingLogo)}
                  className="block w-full text-xs text-body-soft file:mr-3 file:border file:border-line-strong file:bg-paper-2 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-ink-900"
                />
                {uploadingLogo === field ? (
                  <p className="field-help">Uploading logo…</p>
                ) : null}
                {form[field] ? (
                  <img
                    src={form[field]}
                    alt="Logo preview"
                    className="mt-1 h-12 w-12 rounded-xs border border-line object-contain p-1"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="relative border border-line bg-surface p-6">
          <CornerFrame size={44} inset={10} tone="gold" />
          <p className="eyebrow relative">
            <span>Event configuration</span>
          </p>
          <div className="relative grid gap-4">
            <label className="field">
              <span className="field-label">Event title *</span>
              <input
                name="event_title"
                value={form.event_title}
                onChange={handleChange}
                required
                className="input"
              />
            </label>
            <label className="field">
              <span className="field-label">Event description</span>
              <textarea
                name="event_description"
                value={form.event_description}
                onChange={handleChange}
                rows={3}
                className="textarea"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                <span className="field-label">Event date</span>
                <input
                  name="event_date"
                  value={form.event_date}
                  onChange={handleChange}
                  className="input"
                  placeholder="December 25, 2026"
                />
              </label>
              <label className="field">
                <span className="field-label">Event location</span>
                <input
                  name="event_location"
                  value={form.event_location}
                  onChange={handleChange}
                  className="input"
                  placeholder="School campus or event venue"
                />
              </label>
            </div>
            <label className="field">
              <span className="field-label">Notice board</span>
              <textarea
                name="notice_board"
                value={form.notice_board}
                onChange={handleChange}
                rows={2}
                className="textarea"
              />
            </label>
            <label className="field">
              <span className="field-label">Guidelines</span>
              <textarea
                name="guidelines"
                value={form.guidelines}
                onChange={handleChange}
                rows={3}
                className="textarea"
              />
            </label>
            <label className="field mb-0">
              <span className="field-label">Support phone (call / WhatsApp)</span>
              <input
                name="support_phone"
                value={form.support_phone}
                onChange={handleChange}
                className="input"
                placeholder="+8801709202140"
              />
            </label>
          </div>
        </section>

        <section className="relative border border-line bg-paper-2 p-6">
          <CornerFrame size={30} inset={8} tone="ink" />
          <p className="eyebrow relative">
            <span>Theme preset</span>
          </p>
          <p className="relative flex flex-wrap items-center gap-3">
            <span className="pill pill-ink">{themePreset}</span>
            <span className="text-xs text-muted">
              Deep navy, gold, and paper palette with 90-degree corner framing — cloned from
              thinktank-academia.onrender.com.
            </span>
          </p>
        </section>

        {msg.text ? (
          <p
            role={msg.type === "error" ? "alert" : "status"}
            className={`alert ${msg.type === "error" ? "alert-error" : "alert-success"}`}
          >
            {msg.text}
          </p>
        ) : null}

        <button disabled={saving} className="btn btn-ink btn-shine w-full">
          {saving ? "Saving…" : "Save configuration"}
          {!saving ? <Icon name="arrowRight" className="h-4 w-4" /> : null}
        </button>

        <p className="text-center text-[11px] text-muted-2">
          Changes apply to the sign-in screen, registration flow, attendee passes, and A4 print
          layouts.
        </p>
      </form>
    </div>
  );
}
