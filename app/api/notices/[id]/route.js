import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export async function DELETE(request, context) {
  try {
    await initDb();
    const auth = await getAdminFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = Number(params.id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "Invalid notice." }, { status: 400 });
    }

    const result = await db.execute({ sql: "DELETE FROM notices WHERE id = ?", args: [id] });
    if (Number(result.rowsAffected) === 0) {
      return NextResponse.json({ error: "Notice not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notice deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete this notice." }, { status: 500 });
  }
}
