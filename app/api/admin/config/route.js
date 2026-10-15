import { NextResponse } from "next/server";
import { db, initDb, getSystemConfig } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function getAuth(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/okgs_token=([^;]+)/);
  if (!match) return null;
  const payload = verifyToken(decodeURIComponent(match[1]));
  if (!payload || payload.type !== "admin") return null;
  return payload;
}

export async function GET(req) {
  await initDb();
  const cfg = await getSystemConfig();
  return NextResponse.json(cfg);
}

export async function POST(req) {
  try {
    await initDb();
    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      school_name_1,
      school_name_2,
      school_logo_1,
      school_logo_2,
      event_title,
      event_description,
      event_date,
      event_location,
      notice_board,
      guidelines,
    } = body;

    if (!school_name_1 || !school_logo_1 || !event_title) {
      return NextResponse.json({ error: "Missing required branding fields" }, { status: 400 });
    }

    const current = await getSystemConfig();
    if (current) {
      await db.execute({
        sql: `UPDATE system_config SET school_name_1=?, school_name_2=?, school_logo_1=?, school_logo_2=?, event_title=?, event_description=?, event_date=?, event_location=?, notice_board=?, guidelines=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        args: [school_name_1, school_name_2 || "", school_logo_1, school_logo_2 || "", event_title, event_description || "", event_date || "", event_location || "", notice_board || "", guidelines || "", current.id],
      });
    } else {
      await db.execute({
        sql: `INSERT INTO system_config (school_name_1, school_name_2, school_logo_1, school_logo_2, event_title, event_description, event_date, event_location, notice_board, guidelines) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [school_name_1, school_name_2 || "", school_logo_1, school_logo_2 || "", event_title, event_description || "", event_date || "", event_location || "", notice_board || "", guidelines || ""],
      });
    }

    const updated = await getSystemConfig();
    return NextResponse.json({ success: true, config: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
