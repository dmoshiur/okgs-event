import Link from "next/link";

export default function Footer({ config }) {
  const name1 = config?.school_name_1 || "OMAR KINDERGARTEN SCHOOL";
  const name2 = config?.school_name_2 || "";
  const eventTitle = config?.event_title || "Omar Kindergarten School Event";

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-slate-900">O</div>
              <div>
                <p className="font-bold text-white">{name1} & {name2}</p>
                <p className="text-xs text-amber-400">{eventTitle}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {config?.event_description || "A grand celebration of legacy, unity and excellence. Join us for a historic gathering of all batches, honouring our teachers and building future connections."}
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">f</a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">in</a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">X</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Registration</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Login / My Pass</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📍 {config?.event_location || "OKGS School Campus, Joypurhat, Rajshahi, Bangladesh"}</li>
              <li>📅 {config?.event_date || "December 25, 2026"}</li>
              <li>📞 +880 1XXX-XXXXXX</li>
              <li>✉️ info@okgs.edu.bd</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {name1}. All rights reserved. Built for OKGS Genesis Platform.</p>
          <p>Lightweight • Fast • Secure • Made with ❤️ in Joypurhat</p>
        </div>
      </div>
    </footer>
  );
}
