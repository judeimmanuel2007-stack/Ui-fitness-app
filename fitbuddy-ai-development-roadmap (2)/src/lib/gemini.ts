import type { WorkoutPlan } from "@/db/schema";
import {
  normalizePlan,
  parseLlmJson,
  type AthleteProfile,
} from "./fitness";
import {
  generateLocalPlan,
  localNutritionTip,
  reviseLocalPlan,
} from "./local-engine";

/**
 * Gemini integration layer.
 *
 *   Plan generation + feedback revisions → Gemini Pro family (deep reasoning,
 *   structured JSON output). Nutrition tips → Gemini Flash family (fast, cheap).
 *
 * Auth: `GOOGLE_API_KEY` (preferred) or `GEMINI_API_KEY` env var, sent via the
 * `x-goog-api-key` header — never exposed to the client bundle.
 * Without a key we transparently fall back to the built-in deterministic
 * engine so the app keeps working end-to-end in offline sandboxes.
 */

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

export type AiSource = "gemini" | "local";

export interface AiResponse<T> {
  data: T;
  source: AiSource;
  model: string;
}

function apiKey(): string {
  return (
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    ""
  );
}

function proModelChain(): string[] {
  const preferred = process.env.GEMINI_PRO_MODEL?.trim() || "gemini-2.5-pro";
  const fallbacks = [
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ];
  return [preferred, ...fallbacks.filter((m) => m !== preferred)];
}

function flashModelChain(): string[] {
  const preferred = process.env.GEMINI_FLASH_MODEL?.trim() || "gemini-2.5-flash";
  const fallbacks = [
    "gemini-3-flash-preview",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
  ];
  return [preferred, ...fallbacks.filter((m) => m !== preferred)];
}

/* JSON schema (OpenAPI subset) enforcing the 7-day plan contract. */
const PLAN_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    overview: { type: "STRING" },
    coachNote: { type: "STRING" },
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "INTEGER" },
          label: { type: "STRING" },
          focus: { type: "STRING" },
          warmup: { type: "STRING" },
          cooldown: { type: "STRING" },
          exercises: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                sets: { type: "INTEGER" },
                reps: { type: "STRING" },
                rest: { type: "STRING" },
                notes: { type: "STRING" },
              },
              required: ["name", "sets", "reps"],
            },
          },
        },
        required: ["day", "label", "focus", "warmup", "exercises", "cooldown"],
      },
    },
  },
  required: ["title", "overview", "days"],
};

interface CallOptions {
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

/** Calls the first reachable model in the chain via REST generateContent. */
async function callGemini(
  models: string[],
  prompt: string,
  opts: CallOptions = {},
): Promise<{ text: string; model: string }> {
  const key = apiKey();
  if (!key) throw new Error("NO_API_KEY");

  const {
    json = false,
    temperature = 0.7,
    maxOutputTokens = 8192,
    timeoutMs = 45_000,
  } = opts;

  let lastError = "unknown";
  for (const model of models) {
    try {
      const body: Record<string, unknown> = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          ...(json
            ? {
                responseMimeType: "application/json",
                responseSchema: PLAN_RESPONSE_SCHEMA,
              }
            : {}),
        },
      };
      const res = await fetch(`${API_ROOT}/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (!res.ok) {
        lastError = `${model}: HTTP ${res.status}`;
        continue;
      }
      const payload = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const text = (payload.candidates ?? [])
        .flatMap((c) => c.content?.parts ?? [])
        .map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!text) {
        lastError = `${model}: empty response`;
        continue;
      }
      return { text, model };
    } catch (err) {
      lastError = `${model}: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  throw new Error(`All Gemini models failed (${lastError})`);
}

/* ---------------------------- Prompt builders ---------------------------- */

function athleteBlock(profile: AthleteProfile): string {
  return [
    `Athlete: ${profile.name} (ID ${profile.code})`,
    `Age: ${profile.age}, Weight: ${profile.weightKg} kg`,
    `Primary goal: ${profile.goal}`,
    `Requested intensity: ${profile.intensity}`,
  ].join("\n");
}

function planContract(): string {
  return [
    "Return ONLY a JSON object with this exact contract:",
    "{ title, overview, days: [ { day (1-7), label, focus, warmup, cooldown,",
    "exercises: [ { name, sets, reps, rest, notes? } ] } ] }",
    "Rules:",
    "- Exactly 7 day entries, day numbered 1..7.",
    "- warmup: one short sentence, 5-10 minute warm-up.",
    "- cooldown: one short sentence with a recovery/stretch tip.",
    "- reps may be a range like '8-10' or a duration like '40s' or '20 min'.",
    "- rest like '60s', '90s', or '—' for continuous work.",
    "- 4-6 exercises on training days, 3-5 low-intensity movements on recovery days.",
    "- Include at least one dedicated recovery/mobility day.",
    "- overview: 2-3 sentences explaining how the week is structured for this goal.",
    "- overview and notes: under 220 characters each.",
  ].join("\n");
}

function buildPlanPrompt(profile: AthleteProfile): string {
  return [
    "You are FitBuddy, an elite strength & conditioning coach.",
    "Create a personalized, structured 7-day workout plan for this athlete.",
    athleteBlock(profile),
    "Scale total sets, rep ranges and rest periods to the requested intensity.",
    "Match exercise selection and weekly split to the primary goal.",
    "Programs must be safe, progressive and gym-equipment friendly (offer bodyweight swaps in notes when relevant).",
    planContract(),
  ].join("\n\n");
}

function buildNutritionPrompt(profile: AthleteProfile): string {
  return [
    "You are FitBuddy's sports-nutrition assistant.",
    "Give ONE concise, practical nutrition tip (4-6 sentences) tailored to this athlete and their training week.",
    athleteBlock(profile),
    "Be specific: include concrete quantities (protein g/kg, hydration targets, nutrient timing) where useful.",
    "Plain text only — no markdown, no bullets, no headings, no emojis.",
  ].join("\n\n");
}

function buildRevisionPrompt(
  profile: AthleteProfile,
  current: WorkoutPlan,
  feedback: string,
): string {
  return [
    "You are FitBuddy, an elite strength & conditioning coach.",
    "Revise this athlete's existing 7-day workout plan based on their feedback below.",
    "Keep everything that still makes sense; change only what the feedback implies",
    "(exercise swaps, volume, intensity, ordering, session length, recovery).",
    "Arena rules still apply: every day keeps warmup and cooldown.",
    athleteBlock(profile),
    `ATHLETE FEEDBACK: """${feedback}"""`,
    `CURRENT PLAN JSON:\n${JSON.stringify(current)}`,
    planContract(),
    'Additionally set "coachNote" to one sentence summarizing what you changed and why, addressed to the athlete.',
  ].join("\n\n");
}

/* ----------------------------- Public API ------------------------------- */

/** Gemini Pro → structured 7-day plan (semantic equivalent of generate_workout_gemini). */
export async function generateWorkoutPlanGemini(
  profile: AthleteProfile,
): Promise<AiResponse<WorkoutPlan>> {
  try {
    const { text, model } = await callGemini(proModelChain(), buildPlanPrompt(profile), {
      json: true,
      temperature: 0.65,
      maxOutputTokens: 8192,
      timeoutMs: 55_000,
    });
    const plan = normalizePlan(parseLlmJson(text));
    if (plan) return { data: plan, source: "gemini", model };
    throw new Error("Gemini returned an unparseable plan");
  } catch (err) {
    console.warn("[fitbuddy] plan generation fell back to local engine:", err);
    return { data: generateLocalPlan(profile), source: "local", model: "local-engine" };
  }
}

/** Gemini Flash → quick nutrition tip (semantic equivalent of generate_nutrition_tip_with_flash). */
export async function generateNutritionTipFlash(
  profile: AthleteProfile,
): Promise<AiResponse<string>> {
  try {
    const { text, model } = await callGemini(
      flashModelChain(),
      buildNutritionPrompt(profile),
      { temperature: 0.8, maxOutputTokens: 512, timeoutMs: 25_000 },
    );
    const tip = text.replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, "").trim();
    if (tip.length > 20) return { data: tip, source: "gemini", model };
    throw new Error("tip too short");
  } catch (err) {
    console.warn("[fitbuddy] nutrition tip fell back to local engine:", err);
    return { data: localNutritionTip(profile), source: "local", model: "local-engine" };
  }
}

/** Gemini Pro → revise plan from feedback (semantic equivalent of update_workout_plan). */
export async function updateWorkoutPlanGemini(
  profile: AthleteProfile,
  current: WorkoutPlan,
  feedback: string,
): Promise<AiResponse<WorkoutPlan>> {
  try {
    const trimmed = feedback.slice(0, 800);
    const { text, model } = await callGemini(
      proModelChain(),
      buildRevisionPrompt(profile, current, trimmed),
      { json: true, temperature: 0.6, maxOutputTokens: 8192, timeoutMs: 55_000 },
    );
    const plan = normalizePlan(parseLlmJson(text));
    if (plan) return { data: plan, source: "gemini", model };
    throw new Error("Gemini returned an unparseable revision");
  } catch (err) {
    console.warn("[fitbuddy] revision fell back to local engine:", err);
    return {
      data: reviseLocalPlan(profile, current, feedback),
      source: "local",
      model: "local-engine",
    };
  }
}

/** Used by the UI badge to know whether real Gemini calls are possible. */
export function geminiConfigured(): boolean {
  return apiKey().length > 0;
}
