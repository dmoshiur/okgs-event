import { createClient } from "@libsql/client";

let client = null;

function getClient() {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  client = createClient({
    url,
    authToken: authToken || undefined,
  });
  return client;
}

export const db = getClient();

export async function initDb() {
  const c = getClient();
  // system_config
  await c.execute(`
    CREATE TABLE IF NOT EXISTS system_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_name_1 TEXT NOT NULL,
      school_name_2 TEXT,
      school_logo_1 TEXT NOT NULL,
      school_logo_2 TEXT,
      event_title TEXT NOT NULL,
      event_description TEXT,
      event_date TEXT,
      event_location TEXT,
      notice_board TEXT,
      guidelines TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      division TEXT NOT NULL,
      district TEXT NOT NULL,
      upazila TEXT NOT NULL,
      union_name TEXT NOT NULL,
      institute TEXT,
      ssc_batch TEXT,
      photo_url TEXT NOT NULL,
      qr_code_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('check_in', 'check_out')),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      scanned_by INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(scanned_by) REFERENCES admins(id)
    );
  `);

  // Seed system_config if empty
  const cfg = await c.execute("SELECT COUNT(*) as cnt FROM system_config");
  const count = cfg.rows[0]?.cnt ?? 0;
  if (count === 0) {
    await c.execute({
      sql: `INSERT INTO system_config (school_name_1, school_name_2, school_logo_1, school_logo_2, event_title, event_description, event_date, event_location, notice_board, guidelines) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "OKGS High School",
        "Genesis Academy",
        "https://res.cloudinary.com/demo/image/upload/v1/okgs/logo1.png",
        "https://res.cloudinary.com/demo/image/upload/v1/okgs/logo2.png",
        "OKGS Genesis Grand Reunion 2026",
        "A grand celebration of legacy, unity and excellence. Join us for a historic gathering of all batches.",
        "December 25, 2026",
        "OKGS School Campus, Joypurhat",
        "Registration is now open! Early bird closes Dec 10. | Bring your printed pass. | Gate opens 8:00 AM.",
        "1. Bring printed A4 pass with QR. 2. Photo ID may be required. 3. No re-entry without scan. 4. Follow volunteers instructions."
      ]
    });
  }

  // Seed superadmin if none
  const adm = await c.execute("SELECT COUNT(*) as cnt FROM admins");
  const admCount = adm.rows[0]?.cnt ?? 0;
  if (admCount === 0) {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123", 10);
    await c.execute({
      sql: `INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      args: [
        "superadmin",
        process.env.ADMIN_DEFAULT_EMAIL || "admin@okgs.edu.bd",
        hash,
        "superadmin"
      ]
    });
    console.log("Seeded superadmin:", process.env.ADMIN_DEFAULT_EMAIL);
  }
}

export async function getSystemConfig() {
  const c = getClient();
  await initDb();
  const res = await c.execute("SELECT * FROM system_config ORDER BY id DESC LIMIT 1");
  return res.rows[0] || null;
}
