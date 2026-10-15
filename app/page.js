import { getSystemConfig } from "@/lib/db";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getSystemConfig();

  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar config={config} />

      {/* Hero Section with Video */}
      <section className="relative h-[100vh] min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://i.postimg.cc/CxG99ZrK/image.png"
        >
          <source src="https://res.cloudinary.com/tt7oyjd1/video/upload/v1791960191/okgs/film/odyssey-montage-v6.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay absolute inset-0" />
        {/* Subtle grain / vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-xs font-medium tracking-widest uppercase">Registration Open • {config?.event_date || "Dec 25, 2026"}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight">
                {config?.event_title?.split(" ").slice(0,2).join(" ") || "OKGS Genesis"} <br />
                <span className="text-amber-400">{config?.event_title?.split(" ").slice(2).join(" ") || "Grand Reunion 2026"}</span>
              </h1>
              <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
                {config?.event_description || "A historic homecoming of legends. Reconnect, reminisce, and reignite the spirit of OKGS. One day, infinite memories."}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/register" className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-8 py-4 rounded-full font-bold text-sm tracking-wide transition shadow-[0_10px_30px_rgba(245,158,11,0.3)]">
                  Register Now — Free Pass
                </Link>
                <Link href="#details" className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full font-medium text-sm transition">
                  Event Details
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <p className="text-2xl font-black text-white">2000+</p>
                  <p className="text-[11px] uppercase tracking-widest text-white/50">Attendees</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">50+</p>
                  <p className="text-[11px] uppercase tracking-widest text-white/50">Batches</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">1 Day</p>
                  <p className="text-[11px] uppercase tracking-widest text-white/50">Mega Event</p>
                </div>
              </div>
            </div>

            {/* Right Card - Event Info */}
            <div className="lg:ml-auto w-full max-w-md">
              <div className="glass rounded-[24px] p-6 sm:p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-amber-400 text-xs font-bold tracking-widest uppercase">Active Event</p>
                    <h3 className="text-white font-bold text-xl mt-1 leading-tight">{config?.event_title}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-900 font-black">OK</div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">📅</div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wide">Date & Time</p>
                      <p className="text-white font-medium">{config?.event_date || "December 25, 2026"} • 8:00 AM Onwards</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">📍</div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wide">Location</p>
                      <p className="text-white font-medium">{config?.event_location || "OKGS School Campus, Joypurhat"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">🎟️</div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wide">Entry</p>
                      <p className="text-white font-medium">QR Pass Required • Free Registration</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20">
                  <p className="text-amber-200 text-xs leading-relaxed">
                    <strong className="text-amber-400">Notice:</strong> {config?.notice_board || "Registration is now open! Early bird closes Dec 10. Bring your printed pass. Gate opens 8:00 AM."}
                  </p>
                </div>

                <Link href="/register" className="mt-6 w-full bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-full font-bold text-sm text-center block transition">
                  Get Your QR Pass →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/30 text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* Ongoing Events */}
      <section id="ongoing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-2">Live Now</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Ongoing Events</h2>
            </div>
            <Link href="/register" className="hidden sm:inline-flex text-sm font-medium text-slate-900 border border-slate-200 px-5 py-2 rounded-full hover:bg-slate-50">Join Event</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-[20px] border border-slate-200 p-6 hover:shadow-xl transition bg-gradient-to-br from-slate-50 to-white">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">🎤</div>
              <h3 className="font-bold text-slate-900">Registration Drive</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Online registration portal open 24/7. Get your unique QR pass instantly after verification.</p>
              <p className="mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">● LIVE • 1.2k Registered</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 p-6 hover:shadow-xl transition bg-gradient-to-br from-amber-50 to-white">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center mb-4">🏫</div>
              <h3 className="font-bold text-slate-900">Campus Prep</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Stage, lighting, and gallery work in progress. Volunteer team working round the clock.</p>
              <p className="mt-4 text-xs font-bold text-amber-600 bg-amber-100 inline-block px-3 py-1 rounded-full">In Progress • 70% Done</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 p-6 hover:shadow-xl transition bg-white">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">📸</div>
              <h3 className="font-bold text-slate-900">Memory Collection</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Submit your batch photos and stories. Featured in the Grand Hall of Fame.</p>
              <p className="mt-4 text-xs font-bold text-slate-600 bg-slate-100 inline-block px-3 py-1 rounded-full">Submit via Dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Guidelines & Notice */}
      <section id="details" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-2">Know Before You Go</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Event Guidelines & Information</h2>
            <div className="mt-6 prose prose-slate text-sm leading-relaxed text-slate-600">
              <p>{config?.guidelines || "1. Bring printed A4 pass with QR. 2. Photo ID may be required. 3. No re-entry without scan. 4. Follow volunteers instructions."}</p>
              <ul className="mt-4 space-y-3 list-none pl-0">
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs flex-shrink-0">1</span> Bring your printed A4 ticket with QR code. Digital on phone also accepted.</li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs flex-shrink-0">2</span> Entry via QR scan at main gate. Check-in / Check-out logged automatically.</li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs flex-shrink-0">3</span> Dress code: Smart casual / Batch T-shirt encouraged.</li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs flex-shrink-0">4</span> No outside food. Food court available inside campus.</li>
              </ul>
            </div>
            <div className="mt-8 flex gap-3">
              <Link href="/register" className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold">Register Now</Link>
              <Link href="/login" className="bg-white border border-slate-200 px-6 py-3 rounded-full text-sm font-medium">My Pass</Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[20px] p-6 text-white">
              <h4 className="font-bold flex items-center gap-2"><span className="w-2 h-2 bg-amber-400 rounded-full" /> Notice Board</h4>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">{config?.notice_board || "Registration is now open! Early bird closes Dec 10. Bring your printed pass. Gate opens 8:00 AM."}</p>
              <div className="mt-4 h-px bg-white/10" />
              <p className="mt-4 text-xs text-white/50">Last updated: {config?.updated_at ? new Date(config.updated_at).toLocaleString() : "Just now"}</p>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-200 p-6">
              <h4 className="font-bold text-slate-900">How to Register?</h4>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li><strong className="text-slate-900">Step 1:</strong> Scan poster QR or go to /register</li>
                <li><strong className="text-slate-900">Step 2:</strong> Fill form with Division → District → Upazila → Union cascade</li>
                <li><strong className="text-slate-900">Step 3:</strong> Upload photo (auto cropped square via Cloudinary)</li>
                <li><strong className="text-slate-900">Step 4:</strong> Set password, get instant QR pass + email</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Highlights */}
      <section id="previous" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-2">Legacy</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Previous Highlights</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { year: "2020", title: "Golden Jubilee", desc: "50 years celebration with 1500+ alumni, cultural night and honouring retired teachers." },
              { year: "2018", title: "Science Fair", desc: "Inter-school science exhibition, robotics showcase and innovation awards." },
              { year: "2015", title: "Reunion Meet", desc: "First mega reunion after a decade, forming the Genesis alumni network." },
            ].map((item) => (
              <div key={item.year} className="group relative overflow-hidden rounded-[20px] bg-slate-900 p-6 h-[220px] flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
                <img src={`https://picsum.photos/seed/${item.year}/400/300`} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="relative z-20">
                  <span className="text-amber-400 font-black text-sm">{item.year}</span>
                  <h3 className="text-white font-bold text-lg mt-1">{item.title}</h3>
                  <p className="text-white/60 text-sm mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer config={config} />
    </main>
  );
}
