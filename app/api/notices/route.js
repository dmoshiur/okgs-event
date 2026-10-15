import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest, getAuthFromRequest } from "@/lib/auth";

const NOTICE_CATEGORIES = ["Science Fair", "Notice", "Update"];

export async function GET(request) {
  try {
    await initDb();
    const auth = getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await db.execute(
      `SELECT id, title, body, category, urgent, created_at
       FROM notices ORDER BY urgent DESC, created_at DESC, id DESC LIMIT 50`
    );
    return NextResponse.json({
      notices: result.rows.map((row) => ({ ...row, urgent: Number(row.urgent) === 1 })),
    });
  } catch (error) {
    console.error("Notice lookup failed:", error);
    return NextResponse.json({ error: "Unable to load notices." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const title = String(body?.title || "").trim();
    const noticeBody = String(body?.body || "").trim();
    const category = NOTICE_CATEGORIES.includes(body?.category) ? body.category : "Notice";
    const urgent = body?.urgent ? 1 : 0;

    if (!title || title.length > 160) {
      return NextResponse.json({ error: "Enter a notice title under 160 characters." }, { status: 400 });
    }
    if (noticeBody.length > 2000) {
      return NextResponse.json({ error: "Notice text must be under 2,000 characters." }, { status: 400 });
    }

    const result = await db.execute({
      sql: "INSERT INTO notices (title, body, category, urgent, created_by) VALUES (?, ?, ?, ?, ?)",
      args: [title, noticeBody, category, urgent, auth.id],
    });
    return NextResponse.json({
      success: true,
      notice: {
        id: Number(result.lastInsertRowid),
        title,
        body: noticeBody,
        category,
        urgent: urgent === 1,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Notice creation failed:", error);
    return NextResponse.json({ error: "Unable to publish this notice." }, { status: 500 });
  }
}
