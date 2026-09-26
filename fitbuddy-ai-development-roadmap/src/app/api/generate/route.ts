import { db } from "@/db";
import { plans, users } from "@/db/schema";
import { generateNutritionTipFlash, generateWorkoutPlanGemini } from "@/lib/gemini";
import { GOAL_PRESETS, INTENSITIES, type AthleteProfile } from "@/lib/fitness";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const GenerateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  code: z
    .string()
    .trim()
    .min(3, "Athlete ID must be at least 3 characters")
    .max(64)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/, "ID: letters, numbers, dashes, underscores only"),
  age: z.coerce.number().int().min(10).max(100),
  weightKg: z.coerce.number().min(20).max(400),
  goal: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .refine(
      (g) => (GOAL_PRESETS as readonly string[]).includes(g) || g.length <= 60,
      "Goal is too long",
    ),
  intensity: z.enum(INTENSITIES),
});

/**
 * POST /api/generate
 * Body: { name, code, age, weightKg, goal, intensity }
 * → Gemini Pro workout plan + Gemini Flash nutrition tip, persisted to Postgres.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: `${issue.path.join(".")}: ${issue.message}` },
      { status: 400 },
    );
  }

  const profile: AthleteProfile = parsed.data;

  try {
    // Fire both model calls in parallel — Pro for the plan, Flash for the tip.
    const [planRes, tipRes] = await Promise.all([
      generateWorkoutPlanGemini(profile),
      generateNutritionTipFlash(profile),
    ]);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.code, profile.code))
      .limit(1);

    let userId: number;
    if (existing.length > 0) {
      userId = existing[0]!.id;
      await db
        .update(users)
        .set({
          name: profile.name,
          age: profile.age,
          weightKg: profile.weightKg,
          goal: profile.goal,
          intensity: profile.intensity,
        })
        .where(eq(users.id, userId));
      // A fresh generation starts a clean original plan + revision history.
      await db.delete(plans).where(eq(plans.userId, userId));
    } else {
      const inserted = await db
        .insert(users)
        .values({
          code: profile.code,
          name: profile.name,
          age: profile.age,
          weightKg: profile.weightKg,
          goal: profile.goal,
          intensity: profile.intensity,
        })
        .returning({ id: users.id });
      userId = inserted[0]!.id;
    }

    await db.insert(plans).values({
      userId,
      originalPlan: planRes.data,
      currentPlan: planRes.data,
      nutritionTip: tipRes.data,
      revision: 0,
      feedbackLog: [],
      aiSource: planRes.source,
      aiModel: planRes.model,
    });

    return NextResponse.json({
      ok: true,
      code: profile.code,
      source: planRes.source,
    });
  } catch (err) {
    console.error("[fitbuddy] /api/generate failed:", err);
    return NextResponse.json(
      { ok: false, error: "Plan generation failed. Please try again." },
      { status: 502 },
    );
  }
}
