import { createClient } from "@libsql/client";
import { DEFAULT_SUPPORT_PHONE, SCHOOL_LOGO_URL, THEME_PRESET } from "@/lib/constants";

let client;
let initializationPromise;

function getClient() {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  client = createClient({ url, authToken: authToken || undefined });
  return client;
}

export const db = getClient();

async function initializeDatabase(connection) {
  await connection.execute(`
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
      support_phone TEXT DEFAULT '+8801709202140',
      theme_preset TEXT DEFAULT 'thinktank-academia',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Databases created before support_phone existed need the column added in place.
  const configColumns = await connection.execute("PRAGMA table_info(system_config)");
  if (!configColumns.rows.some((column) => column.name === "support_phone")) {
    await connection.execute(
      "ALTER TABLE system_config ADD COLUMN support_phone TEXT DEFAULT '+8801709202140'"
    );
  }

  // Same for the theme preset recorded alongside the cloned design system.
  if (!configColumns.rows.some((column) => column.name === "theme_preset")) {
    await connection.execute(
      "ALTER TABLE system_config ADD COLUMN theme_preset TEXT DEFAULT 'thinktank-academia'"
    );
  }

  await connection.execute(`
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
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('check_in', 'check_out')),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      scanned_by INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(scanned_by) REFERENCES admins(id)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_type TEXT NOT NULL CHECK(account_type IN ('user', 'admin')),
      account_id INTEGER NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT,
      category TEXT NOT NULL DEFAULT 'Notice' CHECK(category IN ('Science Fair', 'Notice', 'Update')),
      urgent INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(
    "CREATE INDEX IF NOT EXISTS idx_attendance_user_timestamp ON attendance_logs(user_id, timestamp DESC)"
  );
  await connection.execute(
    "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)"
  );
  await connection.execute(
    "CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash)"
  );

  const configCount = await connection.execute(
    "SELECT COUNT(*) AS count FROM system_config"
  );
  if (Number(configCount.rows[0]?.count || 0) === 0) {
    await connection.execute({
      sql: `INSERT INTO system_config (
        school_name_1, school_name_2, school_logo_1, school_logo_2,
        event_title, event_description, event_date, event_location,
        notice_board, guidelines, support_phone, theme_preset
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "OMAR KINDERGARTEN SCHOOL",
        "",
        SCHOOL_LOGO_URL,
        "",
        "Omar Kindergarten School Event Portal",
        "Registration and attendance information for school events.",
        "",
        "Omar Kindergarten School, Bangladesh",
        "Event registration is open.",
        "Please bring your event pass and follow the instructions from school staff.",
        DEFAULT_SUPPORT_PHONE,
        THEME_PRESET,
      ],
    });
  } else {
    // Replace the original sample branding only when the system still has the untouched seed.
    await connection.execute({
      sql: `UPDATE system_config SET
        school_name_1=?, school_name_2=?, school_logo_1=?, school_logo_2=?,
        event_title=?, event_description=?, event_date=?, event_location=?,
        notice_board=?, guidelines=?, updated_at=CURRENT_TIMESTAMP
        WHERE school_name_1=? AND school_name_2=? AND school_logo_1=? AND event_title=?`,
      args: [
        "OMAR KINDERGARTEN SCHOOL",
        "",
        SCHOOL_LOGO_URL,
        "",
        "Omar Kindergarten School Event Portal",
        "Registration and attendance information for school events.",
        "",
        "Omar Kindergarten School, Bangladesh",
        "Event registration is open.",
        "Please bring your event pass and follow the instructions from school staff.",
        "OKGS High School",
        "Genesis Academy",
        "https://res.cloudinary.com/demo/image/upload/v1/okgs/logo1.png",
        "OKGS Genesis Grand Reunion 2026",
      ],
    });
  }

  // Installations seeded before the Cloudinary mark was adopted still point at the bundled SVG.
  await connection.execute({
    sql: "UPDATE system_config SET school_logo_1 = ? WHERE school_logo_1 = '/okgs-mark.svg'",
    args: [SCHOOL_LOGO_URL],
  });

  const noticeCount = await connection.execute(
    "SELECT COUNT(*) AS count FROM notices"
  );
  if (Number(noticeCount.rows[0]?.count || 0) === 0) {
    await connection.execute({
      sql: `INSERT INTO notices (title, body, category, urgent) VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
      args: [
        "শিক্ষার্থী ও শিক্ষক লগইন চালু",
        "শিক্ষার্থী ও শিক্ষকরা এখন তাদের অ্যাকাউন্ট দিয়ে লগইন করতে পারবেন।",
        "Update",
        1,
        "বিজ্ঞান মেলার পোস্টার প্রকাশিত",
        "বিজ্ঞান মেলার অফিসিয়াল পোস্টার প্রকাশিত হয়েছে। বিস্তারিত দেখুন।",
        "Science Fair",
        0,
      ],
    });
  }

  const adminCount = await connection.execute(
    "SELECT COUNT(*) AS count FROM admins"
  );
  if (Number(adminCount.rows[0]?.count || 0) === 0) {
    const isProduction = process.env.NODE_ENV === "production";
    const password =
      process.env.ADMIN_DEFAULT_PASSWORD || (isProduction ? null : "Admin@123");

    if (!password) {
      console.warn(
        "No super-admin was seeded. Set ADMIN_DEFAULT_EMAIL and ADMIN_DEFAULT_PASSWORD to bootstrap access."
      );
    } else {
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(password, 12);
      await connection.execute({
        sql: "INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
        args: [
          "superadmin",
          process.env.ADMIN_DEFAULT_EMAIL || "admin@okgs.edu.bd",
          passwordHash,
          "superadmin",
        ],
      });
      console.info(
        `Seeded the initial super-admin account (${process.env.ADMIN_DEFAULT_EMAIL || "admin@okgs.edu.bd"}).`
      );
    }
  }
}

export async function initDb() {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase(getClient()).catch((error) => {
      initializationPromise = undefined;
      throw error;
    });
  }
  return initializationPromise;
}

export async function getSystemConfig() {
  await initDb();
  const result = await getClient().execute(
    "SELECT * FROM system_config ORDER BY id DESC LIMIT 1"
  );
  const row = result.rows[0];
  if (!row) return null;

  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === "bigint"
        ? Number(value)
        : value instanceof Date
          ? value.toISOString()
          : value,
    ])
  );
}
