"use client";
import { useEffect, useState, useRef } from "react";

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [history, setHistory] = useState([]);
  const html5QrCodeRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startScanner() {
    setError("");
    setResult(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrRegionId = "qr-reader";
      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // On success
          console.log("Scanned:", decodedText);
          await handleScan(decodedText);
          // Optional: pause after scan
          // html5QrCode.pause();
        },
        (err) => {
          // ignore scan failure
        }
      );
      setScanning(true);
      setCameraReady(true);
    } catch (e) {
      console.error(e);
      setError("Camera failed: " + e.message + ". Use manual entry below.");
    }
  }

  async function stopScanner() {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }

  async function handleScan(code) {
    setError("");
    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid QR");

      setResult(data);
      setHistory((h) => [data, ...h].slice(0, 10));

      // Play beep
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUQAAACA");
        audio.play().catch(() => {});
      } catch {}
    } catch (e) {
      setError(e.message);
      setResult({ valid: false, error: e.message });
    }
  }

  async function handleManual() {
    if (!manualCode.trim()) return;
    await handleScan(manualCode);
    setManualCode("");
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">Live QR Gate Scanner</h1>
      <p className="text-sm text-slate-500 mt-1">WebCam scan • Validates user • Logs Check-In / Check-Out real-time to Turso</p>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Camera Scanner</h3>
            {!scanning ? (
              <button onClick={startScanner} className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold">Start Camera</button>
            ) : (
              <button onClick={stopScanner} className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold">Stop Camera</button>
            )}
          </div>

          <div id="qr-reader" className="w-full bg-slate-50 rounded-xl overflow-hidden border border-dashed border-slate-300 min-h-[300px] flex items-center justify-center">
            {!scanning && !cameraReady && (
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">📷</div>
                <p className="text-xs text-slate-500">Click Start Camera to scan attendee QR codes. Ensure HTTPS & camera permission.</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Manual Code Entry (Fallback)</label>
            <div className="flex gap-2 mt-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter user_code e.g. OKGS26ABCD1234"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                onKeyDown={(e) => e.key === "Enter" && handleManual()}
              />
              <button onClick={handleManual} className="bg-amber-400 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold">Verify</button>
            </div>
          </div>

          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">{error}</div>}
        </div>

        {/* Result */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[300px]">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Scan Result</h3>
            {!result ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-3">🔍</div>
                <p className="text-xs text-slate-400">No scan yet. Scan a QR to validate attendee.</p>
              </div>
            ) : result.valid === false ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 font-bold">❌ Invalid QR</p>
                <p className="text-xs text-red-500 mt-1">{result.error}</p>
              </div>
            ) : (
              <div>
                <div className={`rounded-xl p-4 border ${result.action === "check_in" ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
                  <p className={`font-black text-sm ${result.action === "check_in" ? "text-emerald-700" : "text-orange-700"}`}>
                    {result.action === "check_in" ? "✅ CHECK-IN SUCCESS" : "👋 CHECK-OUT SUCCESS"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Logged at {new Date().toLocaleString()} • {result.action}</p>
                </div>

                <div className="mt-4 flex gap-4">
                  <img src={result.user.photo_url} alt={result.user.name} className="w-20 h-20 rounded-xl object-cover border-2 border-slate-100" />
                  <div>
                    <h4 className="font-bold text-slate-900">{result.user.name}</h4>
                    <p className="text-xs text-slate-600">{result.user.user_code} • {result.user.phone}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{result.user.division}, {result.user.district}, {result.user.upazila}</p>
                    <p className="text-[11px] text-slate-400">{result.user.institute} {result.user.ssc_batch ? `• ${result.user.ssc_batch}` : ""}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Recent Logs for this user</p>
                  <div className="mt-2 space-y-2">
                    {result.logs?.map((l) => (
                      <div key={l.id} className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${l.type === "check_in" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{l.type}</span>
                        <span className="text-slate-500">{new Date(l.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-sm">Today's Scan History (Last 10)</h3>
            <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto">
              {history.length === 0 ? <p className="text-xs text-white/40">No scans yet</p> : history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-2">
                  <img src={h.user.photo_url} alt={h.user.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{h.user.name} • {h.user.user_code}</p>
                    <p className="text-[10px] text-white/50">{h.action} • {new Date().toLocaleTimeString()}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${h.action === "check_in" ? "bg-emerald-400 text-slate-900" : "bg-orange-400 text-slate-900"}`}>{h.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
