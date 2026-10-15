# Omar Kindergarten School — Event & Attendance Portal

A permanent, responsive event registration and attendance system built with Next.js App Router, Turso/LibSQL, Cloudinary, QR codes, and Nodemailer-compatible SMTP.

## Theme

The interface is a clone of the `thinktank-academia.onrender.com` design system, applied to every screen:

- **Palette** — deep academic ink (`#050d18 → #1f4166`), restrained premium gold (`#c29a3b`, `#9c7826`, `#e4c97e`, `#f7f0dd`), editorial blue (`#1d5bbf`), and warm paper neutrals (`#faf8f3`, `#f3f0e8`, `#ece8dc`, `#fcfaf6`) with hairline lines (`#e7e2d6`, `#d5cebe`). Tokens live in `tailwind.config.js` and as CSS custom properties in `app/globals.css`.
- **Typography** — Fraunces for display headings, Inter for UI, Hind Siliguri for Bangla notices, loaded once from the root layout.
- **90-degree framing engine** — `app/components/CornerFrame.js` renders four precise right-angle brackets inside any relatively positioned container (size, inset, thickness, tone are all configurable). It is used at the viewport level on the sign-in/registration/recovery screens and on cards, panels, stat cards, the gate scanner, the attendee pass, and the printed A4 passes (`.corner-frame--print` survives `@media print`). Corner radii stay disciplined (2–14 px) so nothing reads as a soft app-default card.
- **Preset record** — the preset identifier is stored in `system_config.theme_preset` (default `thinktank-academia`) and is shown read-only on `/admin/settings`.

Shared primitives (`.eyebrow`, `.panel`, `.btn-*`, `.input`, `.stat-card`, `.tag`, `.tab`, `.nav-item`, `.data-table`) are defined once in `app/globals.css`, so pages compose them instead of re-styling ad hoc.

Support contact `+8801709202140` (call and WhatsApp) is rendered from `system_config.support_phone` on the sign-in card footer, the registration footer, the admin sidebar/More sheet, the dashboard help panel, and the attendee dashboard.

## Portal routes

- `/` and `/login` — one unified sign-in screen; there is no marketing or landing page. The sign-in card sits on the muted full-screen school video inside a 90-degree gold frame, with dynamically configured school branding, an amber event pill, attendee/staff sign-in (user and key icons plus password visibility), the navy `Sign in →` action, the attendee-registration link, and password recovery.
- `/register` — public attendee registration with photo upload, a Bangladesh division → district → upazila → union address selector, and an instant QR pass.
- `/dashboard` — attendee pass, QR download, printable ticket, and attendance history.
- `/admin` — staff dashboard with four framed stat cards: total registered users, batch-wise user count (SSC batch distribution), admitted at the gate, and currently inside versus exited. The sidebar carries the school shield, the active-event selector, and the primary modules listed below, plus a help panel and the role tag.
- `/admin/users` — attendee directory (search, edit, delete, manual add, and per-attendee pass printing).
- `/admin/analytics` — Batch Analytics: registrations per SSC batch (`SSC 2024`, `SSC 2025`, `Guest`, …) with admitted, inside, and exited counts.
- `/admin/notices` — notice board: publish, filter, and delete event notices.
- `/admin/scan` — Live Scan: webcam QR scanner with manual-code fallback and alternating check-in/check-out logs. Each scan shows the attendee's photo, name, phone, and batch.
- `/admin/print` — Print Passes: individual or batch A4 pass printing.
- `/admin/settings` — Settings: school logos/names, active event, notice, and ticket branding. The support phone (default `+8801709202140`) is edited here.
- `/admin/admins` — super-admin-only staff account management (Staff Accounts).

The address hierarchy includes all eight divisions and the bundled district/upazila/union lists. The source and license attribution are in `data/LOCATION-DATA-LICENSE.md`.

Support contact (call and WhatsApp) appears on the sign-in card, the admin sidebar, and the attendee dashboard.

## Scope

This portal covers participant registration, batch-wise tracking, pass generation, live gate attendance, and admin controls. Financial accounting, funds, dues, and canteen collections are intentionally out of scope.

## Database

All tables (`system_config`, `users`, `admins`, `attendance_logs`, `password_resets`, `notices`) are created with `CREATE TABLE IF NOT EXISTS` when the server boots, via `instrumentation.js`. Initialization is also retried lazily on the first request if the startup attempt fails.

## Stack

- Next.js 15 App Router / React 18
- Turso LibSQL (`@libsql/client`); local SQLite is used as a development fallback
- Cloudinary for attendee photos and school logos (square crop for attendee photos)
- Nodemailer for SMTP delivery, with optional Resend API fallback
- `qrcode` for attendee passes and `html5-qrcode` for the admin gate scanner
- Tailwind CSS

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and configure the values below.
3. Install dependencies and start the portal:

   ```bash
   npm ci
   npm run dev
   ```

4. Visit `http://localhost:3000`. In development only, if there is no admin account and `ADMIN_DEFAULT_PASSWORD` is unset, a local bootstrap account is seeded as `admin@okgs.edu.bd` / `Admin@123`. Change it before using real data; production does not seed this fallback.

### Required production configuration

- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` — use a Turso `libsql://` URL for persistent production data.
- `JWT_SECRET` — set a unique random value (for example, `openssl rand -base64 32`). Production authentication intentionally has no built-in JWT secret fallback.
- `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD` — set these to bootstrap the first super-admin if the admin table is empty.
- Cloudinary credentials — required for public attendee photo uploads and admin logo uploads.
- `NEXT_PUBLIC_APP_URL` — the canonical public site URL used in email links.

For email, configure either SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`) or `RESEND_API_KEY` / `RESEND_FROM`. SMTP/Nodemailer takes precedence. If email is not configured, registration still creates and displays the pass, but the UI will say that email delivery was skipped.

## Pass and attendance details

- Each attendee receives a unique registration code and QR image immediately after registration. The QR image is attached to the registration email when a mail provider is configured.
- Registration requires a unique phone number, password, valid Bangladesh address, and JPEG/PNG/WebP profile image no larger than 5 MB.
- Passwords are bcrypt-hashed. Session cookies are HTTP-only and secure in production. Password reset links are single-use and expire after 30 minutes; the account must have an email address to receive one.
- Manual attendees do not need to set a password. Their accounts receive an undisclosed random credential rather than a shared default password.
- The gate scanner records check-in/check-out events with the current admin and server timestamp. The camera pauses after a scan to prevent repeated frame reads from generating duplicate attendance events.
- A4 tickets use the specified background template (`https://i.postimg.cc/CxG99ZrK/image.png`), the school logos/names, a centred QR code with the attendee photo embedded in its middle, the attendee name and phone, and a gold 90-degree frame overlay, all at `@page { size: A4 portrait; margin: 0; }`.

## Build and run

```bash
npm run build
npm start
```

`npm run dev` and `npm start` bind to `0.0.0.0:3000` for hosted previews. Configure the Turso, Cloudinary, mail, and auth environment variables in your deployment platform; do not commit `.env.local` or production secrets.
