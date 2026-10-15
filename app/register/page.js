"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { divisions, getDistricts, getUpazilas, getUnions } from "@/data/bd-geo";
import CornerFrame from "@/app/components/CornerFrame";
import SupportContact, { toDialNumber, toWhatsAppNumber } from "@/app/components/SupportContact";
import { Icon } from "@/app/components/Icons";
import { DEFAULT_SUPPORT_PHONE, THEME_VIDEO_URL } from "@/lib/constants";

const REQUIRED_NOTE = "Required fields are marked with *";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    division: "",
    district: "",
    upazila: "",
    union_name: "",
    institute: "",
    ssc_batch: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [emailStatus, setEmailStatus] = useState("not_provided");

  const [districtList, setDistrictList] = useState([]);
  const [upazilaList, setUpazilaList] = useState([]);
  const [unionList, setUnionList] = useState([]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    if (form.division) {
      setDistrictList(getDistricts(form.division));
      setForm((f) => ({ ...f, district: "", upazila: "", union_name: "" }));
    } else {
      setDistrictList([]);
    }
  }, [form.division]);

  useEffect(() => {
    if (form.division && form.district) {
      setUpazilaList(getUpazilas(form.division, form.district));
      setForm((f) => ({ ...f, upazila: "", union_name: "" }));
    } else {
      setUpazilaList([]);
    }
  }, [form.division, form.district]);

  useEffect(() => {
    if (form.division && form.district && form.upazila) {
      setUnionList(getUnions(form.division, form.district, form.upazila));
      setForm((f) => ({ ...f, union_name: "" }));
    } else {
      setUnionList([]);
    }
  }, [form.division, form.district, form.upazila]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP photo.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Your photo must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }
    setError("");
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!photo) throw new Error("Photo is required");
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("photo", photo);

      const res = await fetch("/api/register", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccessData(data.user);
      setEmailStatus(data.email_status || "not_provided");
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const supportPhone = DEFAULT_SUPPORT_PHONE;

  if (successData) {
    return (
      <main className="relative flex min-h-screen items-center justify-center gap-6 bg-ink-950 px-4 py-12 sm:px-6">
        <div aria-hidden="true" className="fixed inset-0 bg-[radial-gradient(900px_520px_at_108%_-12%,rgba(29,91,191,0.28),transparent_58%)]" />

        <section className="reveal relative z-10 w-full max-w-[520px] border border-line-strong bg-surface-warm shadow-floated">
          <CornerFrame size={130} inset={14} tone="gold" className="hidden sm:block" />
          <CornerFrame size={54} inset={10} tone="gold" className="sm:hidden" />

          <header className="relative border-b border-line bg-ink-950 px-6 py-6 text-center text-white">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xs bg-gold text-ink-950">
              <Icon name="check" className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <p className="eyebrow eyebrow-light mt-4 justify-center">
              <span>Registration complete</span>
            </p>
            <h1 className="font-display text-2xl font-semibold text-[#f7f3e9]">Your QR pass is ready</h1>
            <p className="mt-1 text-xs text-white/60">
              Keep this code — it is your identity at the gate and canteen.
            </p>
          </header>

          <div className="relative p-6">
            <div className="text-center">
              <img
                src={successData.photo_url}
                alt="Attendee"
                className="mx-auto h-24 w-24 rounded-xs border border-line object-cover"
              />
              <h2 className="mt-3 font-display text-lg font-semibold text-ink-900">{successData.name}</h2>
              <p className="text-xs text-muted">
                {successData.user_code} • {successData.phone}
              </p>
            </div>

            <div className="relative mt-6 border border-line bg-paper-2 p-4">
              <CornerFrame size={26} inset={7} tone="gold" />
              <p className="eyebrow relative justify-center">
                <span>Your QR pass</span>
              </p>
              <img
                src={successData.qr_code_url}
                alt="QR pass"
                className="mx-auto h-48 w-48 border border-ink-900 bg-white p-1"
              />
              <p className="relative mt-3 text-center text-xs text-muted">
                Show this at the entry gate. Code:{" "}
                <strong className="font-bold text-ink-900">{successData.user_code}</strong>
              </p>
            </div>

            <div className="relative mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => window.print()} className="btn btn-ink">
                Print pass
              </button>
              <Link href="/login" className="btn btn-gold">
                Open dashboard
              </Link>
            </div>

            <p className="relative mt-4 text-center text-[11px] leading-5 text-muted">
              {emailStatus === "sent"
                ? `Your QR pass was emailed to ${successData.email}.`
                : emailStatus === "not_configured"
                  ? "Email delivery is not configured; download or print this pass and keep your registration code."
                  : emailStatus === "failed"
                    ? "We could not send the email. Your pass is ready here—please download or print it."
                    : "You can sign in with your phone number and the password you created."}
            </p>

            <div className="relative mt-5 border-t border-line pt-4 text-center">
              <SupportContact phone={supportPhone} className="text-[11px] leading-5 text-muted" />
              <Link href="/login" className="link-underline mt-3 inline-block text-xs">
                ← Back to sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto grid min-h-screen max-w-[1380px] lg:grid-cols-5">
        {/* Brand panel */}
        <aside className="relative isolate overflow-hidden bg-ink-950 p-8 lg:col-span-2 lg:p-12">
          <video
            aria-hidden="true"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          >
            <source src={THEME_VIDEO_URL} type="video/mp4" />
          </video>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink-950/70" />
          <CornerFrame size={120} inset={18} tone="gold-soft" className="hidden lg:block" />

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <Link href="/login" className="link-underline text-sm text-white/60">
                ← Sign in
              </Link>

              <img
                src="/okgs-mark.svg"
                alt=""
                className="mt-10 h-14 w-14 rounded-xs border border-white/10 bg-white object-contain p-1.5"
              />

              <p className="eyebrow eyebrow-light mt-6">
                <span>Public registration · /register</span>
              </p>
              <h1 className="font-display text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.12] text-[#f5f1e6]">
                Open your <em className="italic text-gold-soft">event pass</em> in under a minute
              </h1>
              <p className="mt-4 max-w-[46ch] text-[0.95rem] leading-7 text-[#a3b0c5]">
                Register as an attendee to receive a unique ID, a QR gate pass, and an A4 printable
                ticket. No paperwork, no queue at the desk.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-[#c4cede]">
                <li className="flex items-center gap-3">
                  <span className="text-gold-soft">01</span> Fill the Bangladesh division → union address
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gold-soft">02</span> Upload a photo (square crop via Cloudinary)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gold-soft">03</span> Receive your QR pass instantly on screen
                </li>
              </ul>
            </div>

            <div className="relative mt-10 border-t border-white/10 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                Technical support
              </p>
              <p className="mt-2 text-xs leading-5 text-white/60">
                <a href={`tel:${toDialNumber(supportPhone)}`} className="font-bold text-gold-soft hover:underline">
                  {supportPhone}
                </a>{" "}
                (
                <a href={`tel:${toDialNumber(supportPhone)}`} className="hover:text-white hover:underline">
                  Call
                </a>
                /
                <a
                  href={`https://wa.me/${toWhatsAppNumber(supportPhone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline"
                >
                  WhatsApp
                </a>
                )
              </p>
            </div>
          </div>
        </aside>

        {/* Form */}
        <div className="lg:col-span-3 lg:p-12 lg:pl-14">
          <div className="mx-auto max-w-3xl p-6 lg:p-0">
            <p className="eyebrow">Attendee registration</p>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.3rem)] font-semibold tracking-tight text-ink-950">
              Event registration form
            </h2>
            <p className="page-lead">{REQUIRED_NOTE}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Photo */}
              <section className="relative border border-line bg-surface p-6">
                <CornerFrame size={40} inset={10} tone="gold" />
                <label className="eyebrow relative mb-0">
                  <span>Photo upload * (square crop)</span>
                </label>
                <div className="relative mt-4 flex flex-wrap items-center gap-5">
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xs border border-dashed border-line-strong bg-paper-2">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Icon name="camera" className="h-6 w-6 text-muted-2" />
                    )}
                  </span>
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhoto}
                      required
                      className="block w-full text-sm text-body-soft file:mr-3 file:border file:border-line-strong file:bg-paper-2 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-ink-900"
                    />
                    <p className="field-help mt-2">
                      JPEG, PNG, or WebP. Maximum 5 MB; stored on Cloudinary as a square crop.
                    </p>
                  </div>
                </div>
              </section>

              {/* Identity */}
              <section className="relative border border-line bg-surface p-6">
                <CornerFrame size={40} inset={10} tone="gold" />
                <p className="eyebrow relative">
                  <span>Identity</span>
                </p>
                <div className="relative grid gap-4 sm:grid-cols-2">
                  <label className="field sm:col-span-2">
                    <span className="field-label">Full name *</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="Md. Example Hossain"
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Phone number *</span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      minLength={7}
                      maxLength={20}
                      pattern="[+0-9(). -]{7,20}"
                      className="input"
                      placeholder="01XXXXXXXXX"
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Password setup *</span>
                    <input
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      maxLength={72}
                      className="input"
                      placeholder="At least 8 characters"
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Email (optional)</span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Institute name (optional)</span>
                    <input
                      name="institute"
                      value={form.institute}
                      onChange={handleChange}
                      className="input"
                      placeholder="OKGS / your institute"
                    />
                  </label>
                  <label className="field sm:col-span-2">
                    <span className="field-label">SSC batch / year (optional)</span>
                    <input
                      name="ssc_batch"
                      value={form.ssc_batch}
                      onChange={handleChange}
                      className="input"
                      placeholder="2015, 2020 etc."
                    />
                  </label>
                </div>
              </section>

              {/* Address */}
              <section className="relative border border-line bg-surface p-6">
                <CornerFrame size={40} inset={10} tone="gold" />
                <p className="eyebrow relative">
                  <span>Bangladesh administrative address *</span>
                </p>
                <div className="relative grid gap-4 sm:grid-cols-2">
                  <label className="field">
                    <span className="field-label">Division *</span>
                    <select
                      name="division"
                      value={form.division}
                      onChange={handleChange}
                      required
                      className="select"
                    >
                      <option value="">Select division</option>
                      {divisions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">District *</span>
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required
                      disabled={!form.division}
                      className="select"
                    >
                      <option value="">Select district</option>
                      {districtList.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">Upazila *</span>
                    <select
                      name="upazila"
                      value={form.upazila}
                      onChange={handleChange}
                      required
                      disabled={!form.district}
                      className="select"
                    >
                      <option value="">Select upazila</option>
                      {upazilaList.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">Union *</span>
                    <select
                      name="union_name"
                      value={form.union_name}
                      onChange={handleChange}
                      required
                      disabled={!form.upazila}
                      className="select"
                    >
                      <option value="">Select union</option>
                      {unionList.map((un) => (
                        <option key={un} value={un}>
                          {un}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              {error ? (
                <p role="alert" className="alert alert-error">
                  {error}
                </p>
              ) : null}

              <button disabled={loading} className="btn btn-ink btn-shine w-full gap-2.5 text-[0.95rem]">
                {loading ? "Registering & generating QR…" : "Register & generate QR pass"}
                {!loading ? <Icon name="arrowRight" className="h-4 w-4" /> : null}
              </button>

              <p className="text-center text-xs text-muted">
                Already registered?{" "}
                <Link href="/login" className="link-underline text-ink-900">
                  Sign in to get your pass
                </Link>
              </p>

              <div className="relative border border-line bg-paper-2 p-4 text-center">
                <CornerFrame size={26} inset={7} tone="ink" />
                <SupportContact phone={supportPhone} className="relative text-[11px] leading-5 text-muted" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
