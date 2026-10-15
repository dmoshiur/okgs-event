# Omar Kindergarten School — Event & Attendance Portal

A permanent, responsive event registration and attendance system built with Next.js App Router, Turso/LibSQL, Cloudinary, QR codes, and Nodemailer-compatible SMTP.

## Portal routes

- `/` and `/login` — one unified sign-in screen; there is no marketing or landing page. The sign-in card uses the muted full-screen school video, dynamically configured school branding, attendee/staff sign-in, password visibility, and password recovery.
- `/register` — public attendee registration with photo upload, a Bangladesh division → district → upazila → union address selector, and an instant QR pass.
- `/dashboard` — attendee pass, QR download, printable ticket, and attendance history.
- `/admin` — staff dashboard: six summary cards (gate figures are live; finance figures show a dash until a fee ledger exists) and a notices feed with filters, expandable notices, urgent badges, and staff-created notices.
- `/admin/canteen`, `/admin/funds`, `/admin/dues`, `/admin/expenses`, `/admin/memos`, `/admin/collections` — navigation placeholders. They state that the module is not connected and show no figures.
- `/admin/scan` — webcam QR scanner with manual-code fallback and alternating check-in/check-out logs.
- `/admin/print` — individual or batch A4 pass printing.
- `/admin/settings` — school logos/names, active event, notice, and ticket branding. The support phone (default `+8801709202140`) is edited here.
- `/admin/admins` — super-admin-only staff account management.

The address hierarchy includes all eight divisions and the bundled district/upazila/union lists. The source and license attribution are in `data/LOCATION-DATA-LICENSE.md`.

Support contact (call and WhatsApp) appears on the sign-in card, the admin sidebar, and the attendee dashboard.

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
- A4 tickets use the specified background template and `@page { size: A4 portrait; margin: 0; }` print sizing.

## Build and run

```bash
npm run build
npm start
```

`npm run dev` and `npm start` bind to `0.0.0.0:3000` for hosted previews. Configure the Turso, Cloudinary, mail, and auth environment variables in your deployment platform; do not commit `.env.local` or production secrets.
