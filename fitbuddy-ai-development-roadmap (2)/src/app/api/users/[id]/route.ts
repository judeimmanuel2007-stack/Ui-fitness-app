import { db } from "@/db";
import { plans, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/users/[id] — remove an athlete and their plan (admin panel).
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const userId = Number.parseInt(id, 10);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ ok: false, error: "Invalid user id" }, { status: 400 });
  }
  try {
    await db.delete(plans).where(eq(plans.userId, userId));
    const removed = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
    if (removed.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[fitbuddy] delete user failed:", err);
    return NextResponse.json({ ok: false, error: "Delete failed" }, { status: 500 });
  }
}
