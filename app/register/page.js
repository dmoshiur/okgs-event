"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { divisions, getDistricts, getUpazilas, getUnions } from "@/data/bd-geo";

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

  const [districtList, setDistrictList] = useState([]);
  const [upazilaList, setUpazilaList] = useState([]);
  const [unionList, setUnionList] = useState([]);

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
  }, [form.district]);

  useEffect(() => {
    if (form.division && form.district && form.upazila) {
      setUnionList(getUnions(form.division, form.district, form.upazila));
      setForm((f) => ({ ...f, union_name: "" }));
    } else {
      setUnionList([]);
    }
  }, [form.upazila]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
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
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[24px] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-400 rounded-full flex items-center justify-center text-2xl mb-3">✓</div>
            <h2 className="text-white font-black text-xl">Registration Successful!</h2>
            <p className="text-white/60 text-sm mt-1">Your QR Pass is ready</p>
          </div>
          <div className="p-6">
            <div className="text-center">
              <img src={successData.photo_url} alt="User" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-slate-100" />
              <h3 className="font-bold text-slate-900 mt-3 text-lg">{successData.name}</h3>
              <p className="text-xs text-slate-500">{successData.user_code} • {successData.phone}</p>
            </div>

            <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 text-center mb-3">Your QR Pass</p>
              <img src={successData.qr_code_url} alt="QR" className="w-48 h-48 mx-auto rounded-xl border-4 border-slate-900" />
              <p className="text-center text-xs text-slate-500 mt-3">Show this at entry gate. Code: <strong className="text-slate-900">{successData.user_code}</strong></p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => window.print()}
                className="bg-slate-900 text-white py-3 rounded-xl text-sm font-bold"
              >
                Print Pass
              </button>
              <Link href="/login" className="bg-amber-400 text-slate-900 py-3 rounded-xl text-sm font-bold text-center">
                Login to Dashboard
              </Link>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-4">Email sent to {successData.email || "your email"} (if provided). You can login with phone & password.</p>

            <div className="mt-4 text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-900">← Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 min-h-screen">
        {/* Left info */}
        <div className="lg:col-span-2 bg-slate-950 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20">
            <source src="https://res.cloudinary.com/tt7oyjd1/video/upload/v1791960191/okgs/film/odyssey-montage-v6.mp4" type="video/mp4" />
          </video>
          <div className="relative z-10">
            <Link href="/" className="text-white/60 hover:text-white text-sm">← Home</Link>
            <div className="mt-10">
              <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center font-black text-slate-900">OK</div>
              <h1 className="text-4xl font-black text-white mt-6 leading-tight">Join the <span className="text-amber-400">Genesis</span> Reunion</h1>
              <p className="text-white/60 text-sm mt-4 leading-relaxed">Register in 60 seconds. Get instant QR pass, email confirmation, and A4 printable ticket. Lightweight, fast, works on mid-range devices.</p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex gap-3 text-sm text-white/80"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">1</span> Fill Bangladesh cascading address</div>
              <div className="flex gap-3 text-sm text-white/80"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">2</span> Upload photo (auto square crop via Cloudinary)</div>
              <div className="flex gap-3 text-sm text-white/80"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">3</span> Get QR + Email instantly</div>
            </div>
          </div>
          <div className="relative z-10 mt-10">
            <p className="text-white/30 text-[11px]">Public Poster QR Registration Link • /register</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 p-6 lg:p-12 bg-slate-50 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900">Registration Form</h2>
            <p className="text-sm text-slate-500 mt-1">Required fields marked with *</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Photo */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Photo Upload * (Square Crop)</label>
                <div className="mt-3 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-xs">No Photo</span>}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" required />
                    <p className="text-[11px] text-slate-400 mt-1">JPG/PNG, max 5MB. Will be uploaded to Cloudinary cropped 400x400.</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm" placeholder="Md. Example Hossain" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm" placeholder="01XXXXXXXXX" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password Setup *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm" placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email (Optional)</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Institute Name (Optional)</label>
                  <input name="institute" value={form.institute} onChange={handleChange} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm" placeholder="OKGS / Your Institute" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">SSC Batch / Year (Optional)</label>
                  <input name="ssc_batch" value={form.ssc_batch} onChange={handleChange} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm" placeholder="2015, 2020 etc" />
                </div>
              </div>

              {/* Cascading Address */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Address: Bangladesh Administrative Structure *</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Division *</label>
                    <select name="division" value={form.division} onChange={handleChange} required className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm bg-white">
                      <option value="">Select Division</option>
                      {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">District *</label>
                    <select name="district" value={form.district} onChange={handleChange} required disabled={!form.division} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm bg-white disabled:opacity-50">
                      <option value="">Select District</option>
                      {districtList.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Upazila *</label>
                    <select name="upazila" value={form.upazila} onChange={handleChange} required disabled={!form.district} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm bg-white disabled:opacity-50">
                      <option value="">Select Upazila</option>
                      {upazilaList.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Union *</label>
                    <select name="union_name" value={form.union_name} onChange={handleChange} required disabled={!form.upazila} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm bg-white disabled:opacity-50">
                      <option value="">Select Union</option>
                      {unionList.map((un) => <option key={un} value={un}>{un}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">{error}</div>}

              <button disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-sm transition">
                {loading ? "Registering & Generating QR..." : "Register & Generate QR Pass →"}
              </button>

              <p className="text-center text-xs text-slate-500">Already registered? <Link href="/login" className="font-bold text-slate-900">Login to get your pass</Link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
