import { db } from "@/db";
import { plans, users, type FeedbackEntry } from "@/db/schema";
import { updateWorkoutPlanGemini } from "@/lib/gemini";
import type { AthleteProfile } from "@/lib/fitness";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const FeedbackSchema = z.object({
  code: z.string().trim().min(1).max(64),
  feedback: z
    .string()
    .trim()
    .min(3, "Tell the coach a bit more (min 3 characters)")
    .max(800, "Keep feedback under 800 characters"),
});

/**
 * POST /api/feedback
 * Body: { code, feedback }
 * → Fetches the athlete's current plan, asks Gemini Pro to revise it against
 *   the feedback, persists the new revision + feedback log entry.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: issue.message }, { status: 400 });
  }

  const { code, feedback } = parsed.data;

  try {
    const rows = await db
      .select({ user: users, plan: plans })
      .from(users)
      .innerJoin(plans, eq(plans.userId, users.id))
      .where(eq(users.code, code))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No athlete found with that ID." },
        { status: 404 },
      );
    }

    const { user, plan } = rows[0]!;
    const profile: AthleteProfile = {
      name: user.name,
      code: user.code,
      age: user.age,
      weightKg: user.weightKg,
      goal: user.goal,
      intensity: user.intensity,
    };

    const revision = await updateWorkoutPlanGemini(profile, plan.currentPlan, feedback);

    const nextRevision = plan.revision + 1;
    const log: FeedbackEntry[] = [
      ...(plan.feedbackLog ?? []),
      { feedback, revision: nextRevision, at: new Date().toISOString() },
    ];

    await db
      .update(plans)
      .set({
        currentPlan: revision.data,
        revision: nextRevision,
        feedbackLog: log,
        aiSource: revision.source,
        aiModel: revision.model,
        updatedAt: new Date(),
      })
      .where(eq(plans.id, plan.id));

    return NextResponse.json({ ok: true, revision: nextRevision, source: revision.source });
  } catch (err) {
    console.error("[fitbuddy] /api/feedback failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not update your plan. Please try again." },
      { status: 502 },
    );
  }
}
