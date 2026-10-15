import { NextResponse } from "next/server";
import { isValidAddress } from "@/data/bd-geo";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

const USER_COLUMNS = `id, user_code, name, phone, email, division, district,
  upazila, union_name, institute, ssc_batch, photo_url, qr_code_url, created_at`;
const PHONE_PATTERN = /^\+?[0-9().\s-]{7,20}$/;

async function getUserId(context) {
  const params = await context.params;
  return String(params.id || "");
}

export async function GET(request, context) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = await getUserId(context);
    const result = await db.execute({
      sql: `SELECT ${USER_COLUMNS} FROM users WHERE id = ?`,
      args: [id],
    });
    if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Attendee lookup failed:", error);
    return NextResponse.json({ error: "Unable to load attendee." }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = await getUserId(context);
    const body = await request.json();
    const currentResult = await db.execute({
      sql: `SELECT ${USER_COLUMNS} FROM users WHERE id = ?`,
      args: [id],
    });
    const current = currentResult.rows[0];
    if (!current) return NextResponse.json({ error: "Attendee not found." }, { status: 404 });

    const updated = {
      name: body.name === undefined ? current.name : String(body.name).trim(),
      phone: body.phone === undefined ? current.phone : String(body.phone).trim(),
      email: body.email === undefined ? current.email : String(body.email).trim().toLowerCase() || null,
      division: body.division === undefined ? current.division : String(body.division).trim(),
      district: body.district === undefined ? current.district : String(body.district).trim(),
      upazila: body.upazila === undefined ? current.upazila : String(body.upazila).trim(),
      union_name: body.union_name === undefined ? current.union_name : String(body.union_name).trim(),
      institute: body.institute === undefined ? current.institute : String(body.institute).trim() || null,
      ssc_batch: body.ssc_batch === undefined ? current.ssc_batch : String(body.ssc_batch).trim() || null,
      photo_url: body.photo_url === undefined ? current.photo_url : String(body.photo_url).trim(),
    };

    if (!updated.name || updated.name.length > 100 || !PHONE_PATTERN.test(updated.phone)) {
      return NextResponse.json({ error: "Enter a valid attendee name and phone number." }, { status: 400 });
    }
    if (!isValidAddress(updated)) {
      return NextResponse.json({ error: "Choose a valid division, district, upazila, and union." }, { status: 400 });
    }
    if (updated.email && (updated.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email))) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (
      !updated.photo_url ||
      updated.photo_url.length > 2048 ||
      !(updated.photo_url.startsWith("/") || /^https:\/\//i.test(updated.photo_url))
    ) {
      return NextResponse.json({ error: "Enter a valid photo URL." }, { status: 400 });
    }

    await db.execute({
      sql: `UPDATE users SET name=?, phone=?, email=?, division=?, district=?, upazila=?,
        union_name=?, institute=?, ssc_batch=?, photo_url=? WHERE id=?`,
      args: [
        updated.name,
        updated.phone,
        updated.email,
        updated.division,
        updated.district,
        updated.upazila,
        updated.union_name,
        updated.institute,
        updated.ssc_batch,
        updated.photo_url,
        id,
      ],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed: users.phone")) {
      return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
    }
    console.error("Attendee update failed:", error);
    return NextResponse.json({ error: "Unable to update attendee." }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = await getUserId(context);
    const existing = await db.execute({ sql: "SELECT id FROM users WHERE id = ?", args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: "Attendee not found." }, { status: 404 });

    await db.execute({ sql: "DELETE FROM attendance_logs WHERE user_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendee deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete attendee." }, { status: 500 });
  }
}
