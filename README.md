# OKGS Genesis Platform — Event Management & Attendance System

Full-stack Next.js (App Router) event portal with Turso LibSQL, Cloudinary, Tailwind, QR scanner, Resend.

## Features
- Landing page with muted video background, dynamic branding from admin
- Public poster QR registration (/register) with BD Division→District→Upazila→Union cascading
- Photo upload to Cloudinary (400x400 face crop)
- Instant QR code generation, email via Resend
- Unified login (/login) - phone/email + password for users, username/email for admin/staff
- User dashboard (/dashboard) with A4 ticket preview
- Admin panel (/admin):
  - Dashboard stats
  - User directory with search, edit, delete, manual add (default pass 123456)
  - Live QR gate scanner (/admin/scan) using html5-qrcode, logs check_in/check_out
  - A4 print engine (/admin/print) with background https://i.postimg.cc/CxG99ZrK/image.png, 210x297mm, @page 0 margin
  - Branding settings (/admin/settings) - 2 logos, 2 school names, event title/desc/date/location/notice/guidelines
  - Multi-admin RBAC (/admin/admins) - superadmin can create staff/superadmin
  - Attendance logs (/admin/attendance)

## Tech Stack
- Next.js 14 App Router
- @libsql/client (Turso SQLite)
- cloudinary SDK
- qrcode, html5-qrcode
- bcryptjs, jsonwebtoken
- Resend (HTTP API, no SDK dependency)
- Tailwind CSS

## Database Schema (SQLite)
- system_config
- users (user_code UNIQUE, phone UNIQUE, photo_url, qr_code_url)
- admins (username UNIQUE, email UNIQUE, role superadmin|staff)
- attendance_logs (user_id, type check_in|check_out, scanned_by)

## Setup
1. Copy `.env.example` to `.env.local` and fill:
   - TURSO_DATABASE_URL=file:local.db (or Turso URL)
   - TURSO_AUTH_TOKEN=
   - CLOUDINARY_*
   - JWT_SECRET
   - RESEND_API_KEY
   - RESEND_FROM
2. npm install
3. npm run dev (binds 0.0.0.0:3000)
4. Default superadmin: admin@okgs.edu.bd / Admin@123 (from env)

## Build
npm run build && npm start

## Print Spec
- @page { size: A4 portrait; margin: 0; }
- Background stretched 210mm x 297mm
- QR centered with photo embedded
- Logos & names top header

## Notes
- Lightweight, no heavy graphics, works on mid-range devices
- Video muted autoplay loop playsinline
- All APIs under /api/*
- Auth via httpOnly cookie okgs_token (JWT 7d)

## License
MIT for OKGS
