import { NextResponse } from "next/server";
import { db, getSystemConfig, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

function isImageUrl(value, required = false) {
  if (!value && !required) return true;
  if (typeof value !== "string" || value.length > 2048) return false;
  return value.startsWith("/") || /^https:\/\//i.test(value);
}

export async function GET() {
  try {
    await initDb();
    return NextResponse.json(await getSystemConfig());
  } catch (error) {
    console.error("Config lookup failed:", error);
    return NextResponse.json({ error: "Unable to load event configuration." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const values = {
      school_name_1: String(body.school_name_1 || "").trim(),
      school_name_2: String(body.school_name_2 || "").trim(),
      school_logo_1: String(body.school_logo_1 || "").trim(),
      school_logo_2: String(body.school_logo_2 || "").trim(),
      event_title: String(body.event_title || "").trim(),
      event_description: String(body.event_description || "").trim(),
      event_date: String(body.event_date || "").trim(),
      event_location: String(body.event_location || "").trim(),
      notice_board: String(body.notice_board || "").trim(),
      guidelines: String(body.guidelines || "").trim(),
    };

    if (
      !values.school_name_1 ||
      !values.event_title ||
      !isImageUrl(values.school_logo_1, true) ||
      !isImageUrl(values.school_logo_2)
    ) {
      return NextResponse.json(
        { error: "Add a school name, a valid primary logo URL, and an event title." },
        { status: 400 }
      );
    }
    if (Object.values(values).some((value) => value.length > 2000)) {
      return NextResponse.json({ error: "Configuration fields must be under 2,000 characters." }, { status: 400 });
    }

    const current = await getSystemConfig();
    if (current) {
      await db.execute({
        sql: `UPDATE system_config SET
          school_name_1=?, school_name_2=?, school_logo_1=?, school_logo_2=?,
          event_title=?, event_description=?, event_date=?, event_location=?,
          notice_board=?, guidelines=?, updated_at=CURRENT_TIMESTAMP
          WHERE id=?`,
        args: [...Object.values(values), current.id],
      });
    } else {
      await db.execute({
        sql: `INSERT INTO system_config (
          school_name_1, school_name_2, school_logo_1, school_logo_2,
          event_title, event_description, event_date, event_location,
          notice_board, guidelines
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: Object.values(values),
      });
    }

    return NextResponse.json({ success: true, config: await getSystemConfig() });
  } catch (error) {
    console.error("Config update failed:", error);
    return NextResponse.json({ error: "Unable to save event configuration." }, { status: 500 });
  }
}
