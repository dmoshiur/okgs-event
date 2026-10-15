"use client";
import { useEffect, useState, useRef } from "react";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [history, setHistory] = useState([]);
  const html5QrCodeRef = useRef(null);
  const scanBusyRef = useRef(false);
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
          if (scanBusyRef.current) return;
          try {
            html5QrCode.pause();
          } catch {}
          await handleScan(decodedText);
        },
        () => {
          // ignore per-frame decode misses
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
    setCameraReady(false);
  }

  async function handleScan(code) {
    const qrCode = String(code || "").trim();
    if (!qrCode || scanBusyRef.current) return;
    scanBusyRef.current = true;
    setError("");
    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: qrCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid QR");

      setResult(data);
      setHistory((h) => [data, ...h].slice(0, 10));
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUQAAACA");
        audio.play().catch(() => {});
      } catch {}
    } catch (e) {
      setError(e.message);
      setResult({ valid: false, error: e.message });
    } finally {
      scanBusyRef.current = false;
    }
  }

  async function resumeScanner() {
    try {
      await html5QrCodeRef.current?.resume();
      setError("");
      setResult(null);
    } catch (e) {
      setError("Unable to resume the camera. Stop it and start again.");
    }
  }

  async function handleManual() {
    if (!manualCode.trim()) return;
    await handleScan(manualCode);
    setManualCode("");
  }

  return (
    <div>
      <p className="eyebrow">Live gate scanner</p>
      <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink-950">
        QR gate scanner
      </h1>
      <p className="page-lead">
        Webcam scan • validates the attendee • logs check-in / check-out to Turso in real time.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Scanner */}
        <section className="relative border border-line bg-surface p-6">
          <CornerFrame size={40} inset={10} tone="gold" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[1.05rem] font-semibold text-ink-900">Camera scanner</h2>
            {!scanning ? (
              <button onClick={startScanner} className="btn btn-ink btn-sm">
                <Icon name="camera" className="h-4 w-4" /> Start camera
              </button>
            ) : (
              <div className="flex gap-2">
                {result || error ? (
                  <button onClick={resumeScanner} className="btn btn-gold btn-sm">
                    Scan next pass
                  </button>
                ) : null}
                <button onClick={stopScanner} className="btn btn-danger btn-sm">
                  Stop camera
                </button>
              </div>
            )}
          </div>

          <div
            id="qr-reader"
            className="relative mt-4 flex min-h-[300px] w-full items-center justify-center overflow-hidden border border-dashed border-line-strong bg-paper-2"
          >
            {!scanning && !cameraReady ? (
              <div className="p-8 text-center">
                <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xs border border-line bg-surface text-ink-900">
                  <Icon name="scan" className="h-6 w-6" />
                </span>
                <p className="text-xs leading-5 text-muted">
                  Start the camera to scan attendee QR codes. HTTPS and camera permission are required.
                </p>
              </div>
            ) : null}
          </div>

          <p className="relative mt-3 text-[11px] leading-5 text-muted-2">
            The camera pauses after each pass so a single QR cannot log an accidental duplicate
            check-in or check-out. Choose “Scan next pass” to continue.
          </p>

          <div className="relative mt-6">
            <label htmlFor="manual-code" className="field-label">
              Manual code entry (fallback)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. OKGS26ABCD1234"
                className="input flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleManual()}
              />
              <button onClick={handleManual} className="btn btn-gold btn-sm">
                Verify
              </button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="alert alert-error relative mt-4">
              {error}
            </p>
          ) : null}
        </section>

        {/* Result */}
        <div className="space-y-6">
          <section className="relative min-h-[300px] border border-line bg-surface p-6">
            <CornerFrame size={40} inset={10} tone="gold" />
            <h2 className="relative font-display text-[1.05rem] font-semibold text-ink-900">
              Scan result
            </h2>

            {!result ? (
              <div className="relative py-12 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xs border border-line bg-paper-2 text-muted">
                  <Icon name="search" className="h-5 w-5" />
                </span>
                <p className="text-xs text-muted-2">No scan yet. Scan a QR pass to validate an attendee.</p>
              </div>
            ) : result.valid === false ? (
              <div className="relative mt-4 border border-[#e5b9b6] bg-state-error-bg p-4 text-center">
                <p className="font-display font-semibold text-state-error">Invalid QR pass</p>
                <p className="mt-1 text-xs text-state-error/80">{result.error}</p>
              </div>
            ) : (
              <div className="relative mt-4">
                <div
                  className={`border p-4 ${
                    result.action === "check_in"
                      ? "border-[#b7dcc8] bg-state-success-bg"
                      : "border-gold/40 bg-gold-tint"
                  }`}
                >
                  <p
                    className={`font-display text-sm font-bold ${
                      result.action === "check_in" ? "text-state-success" : "text-gold-deep"
                    }`}
                  >
                    {result.action === "check_in" ? "Check-in recorded" : "Check-out recorded"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    Logged at {new Date().toLocaleString()}
                  </p>
                </div>

                <div className="mt-4 flex gap-4">
                  <img
                    src={result.user.photo_url}
                    alt={result.user.name}
                    className="h-20 w-20 rounded-xs border border-line object-cover"
                  />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink-900">{result.user.name}</h3>
                    <p className="text-xs text-body-soft">
                      {result.user.user_code} • {result.user.phone}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {result.user.division}, {result.user.district}, {result.user.upazila}
                    </p>
                    <p className="text-[11px] text-muted-2">
                      {result.user.institute} {result.user.ssc_batch ? `• ${result.user.ssc_batch}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-2">
                    Recent logs for this attendee
                  </p>
                  <div className="mt-2 space-y-2">
                    {result.logs?.map((l) => (
                      <div key={l.id} className="flex items-center justify-between border-b border-line pb-1.5">
                        <span
                          className={`tag uppercase ${l.type === "check_in" ? "tag-success" : "tag-warning"}`}
                        >
                          {l.type === "check_in" ? "Check-in" : "Check-out"}
                        </span>
                        <span className="text-xs text-muted">{new Date(l.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* History */}
          <section className="relative border border-line-strong bg-ink-950 p-6 text-white">
            <CornerFrame size={52} inset={10} tone="gold-soft" />
            <h2 className="relative font-display text-[1.05rem] font-semibold text-[#f7f3e9]">
              Today&apos;s scan history (last 10)
            </h2>
            <div className="relative mt-4 max-h-[260px] space-y-2 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-white/40">No scans yet</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 border border-white/10 bg-white/[0.04] p-2">
                    <img
                      src={h.user.photo_url}
                      alt={h.user.name}
                      className="h-8 w-8 rounded-xs border border-white/15 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {h.user.name} • {h.user.user_code}
                      </p>
                      <p className="text-[10px] text-white/50">
                        {h.action} • {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`tag uppercase ${
                        h.action === "check_in" ? "tag-success" : "tag-warning"
                      }`}
                    >
                      {h.action === "check_in" ? "In" : "Out"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
