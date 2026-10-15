"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar({ config }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logo1 = config?.school_logo_1 || "/logo1.png";
  const logo2 = config?.school_logo_2 || "/logo2.png";
  const name1 = config?.school_name_1 || "OKGS High School";
  const name2 = config?.school_name_2 || "Genesis Academy";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logos & Names */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src={logo1} alt="Logo 1" className="w-10 h-10 rounded-full object-cover bg-white p-1" onError={(e)=>e.target.src='https://via.placeholder.com/40'} />
            <div className="hidden sm:block leading-tight">
              <p className="text-white font-bold text-[13px]">{name1}</p>
              <p className="text-white/70 text-[10px]">Est. 1970</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <img src={logo2} alt="Logo 2" className="w-10 h-10 rounded-full object-cover bg-white p-1" onError={(e)=>e.target.src='https://via.placeholder.com/40'} />
            <div className="hidden md:block leading-tight">
              <p className="text-white font-bold text-[13px]">{name2}</p>
              <p className="text-amber-400 text-[10px] font-medium">Genesis Platform</p>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-white/90 hover:text-white text-sm font-medium transition">Home</Link>
          <Link href="/#ongoing" className="text-white/70 hover:text-white text-sm transition">Ongoing Events</Link>
          <Link href="/#previous" className="text-white/70 hover:text-white text-sm transition">Previous Events</Link>
          <Link href="/#details" className="text-white/70 hover:text-white text-sm transition">Event Details</Link>
          <Link href="/register" className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2 rounded-full text-sm font-bold transition">Register Now</Link>
          <Link href="/login" className="border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-full text-sm transition">Login</Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-slate-900/98 backdrop-blur-xl border-t border-white/10 px-4 py-6 space-y-4">
          <Link href="/" onClick={()=>setOpen(false)} className="block text-white py-2">Home</Link>
          <Link href="/#ongoing" onClick={()=>setOpen(false)} className="block text-white/70 py-2">Ongoing Events</Link>
          <Link href="/#previous" onClick={()=>setOpen(false)} className="block text-white/70 py-2">Previous Events</Link>
          <Link href="/#details" onClick={()=>setOpen(false)} className="block text-white/70 py-2">Event Details</Link>
          <div className="flex gap-3 pt-4">
            <Link href="/register" onClick={()=>setOpen(false)} className="flex-1 bg-amber-400 text-slate-900 text-center py-3 rounded-xl font-bold">Register</Link>
            <Link href="/login" onClick={()=>setOpen(false)} className="flex-1 border border-white/20 text-white text-center py-3 rounded-xl">Login</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
