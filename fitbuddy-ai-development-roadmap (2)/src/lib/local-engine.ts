import type { WorkoutDay, WorkoutPlan } from "@/db/schema";
import { goalKey, hashSeed, type AthleteProfile } from "./fitness";

/**
 * Deterministic on-device plan engine. Used only when no Gemini API key is
 * configured (or every Gemini endpoint is unreachable) so the product never
 * hard-fails. Output follows the exact same WorkoutPlan contract as Gemini.
 */

interface Move {
  name: string;
  notes?: string;
}

const PUSH: Move[] = [
  { name: "Barbell Bench Press", notes: "Control the eccentric (3s down)" },
  { name: "Overhead Dumbbell Press" },
  { name: "Incline Push-Up", notes: "Slow tempo" },
  { name: "Weighted Dips", notes: "Bench dips if weighted is too heavy" },
  { name: "Lateral Raises" },
  { name: "Cable Triceps Pushdown" },
  { name: "Pike Push-Ups" },
];

const PULL: Move[] = [
  { name: "Pull-Ups or Lat Pulldown" },
  { name: "Bent-Over Barbell Row" },
  { name: "Seated Cable Row", notes: "Squeeze shoulder blades" },
  { name: "Face Pulls" },
  { name: "Hammer Curls" },
  { name: "Reverse Flyes" },
  { name: "Dead Hang", notes: "Grip + posture" },
];

const LEGS: Move[] = [
  { name: "Back Squat or Goblet Squat" },
  { name: "Romanian Deadlift", notes: "Hinge, soft knees" },
  { name: "Walking Lunges" },
  { name: "Leg Press" },
  { name: "Standing Calf Raises", notes: "Pause at the top" },
  { name: "Glute Bridge" },
  { name: "Bulgarian Split Squat" },
];

const CORE: Move[] = [
  { name: "Plank", notes: "Ribs down, glutes tight" },
  { name: "Hanging Knee Raises" },
  { name: "Russian Twists" },
  { name: "Mountain Climbers" },
  { name: "Dead Bug" },
  { name: "Side Plank" },
];

const CARDIO: Move[] = [
  { name: "Incline Treadmill Walk" },
  { name: "Rowing Machine Intervals" },
  { name: "Assault Bike" },
  { name: "Jump Rope" },
  { name: "Burpees" },
  { name: "Kettlebell Swings" },
];

const MOBILITY: Move[] = [
  { name: "World's Greatest Stretch" },
  { name: "Cat-Cow Flow" },
  { name: "90/90 Hip Switches" },
  { name: "Deep Squat Hold" },
  { name: "Thoracic Rotations" },
  { name: "Downward Dog to Cobra" },
];

interface IntensitySpec {
  compoundSets: number;
  accessorySets: number;
  compoundReps: string;
  accessoryReps: string;
  rest: string;
  cardioMinutes: number;
}

function intensitySpec(intensity: string, goal: string): IntensitySpec {
  const g = goalKey(goal);
  const base: Record<string, IntensitySpec> = {
    low: {
      compoundSets: 2,
      accessorySets: 2,
      compoundReps: g === "strength" ? "6" : "10–12",
      accessoryReps: "12–15",
      rest: "90s",
      cardioMinutes: 15,
    },
    medium: {
      compoundSets: 3,
      accessorySets: 3,
      compoundReps: g === "strength" ? "5–6" : "8–10",
      accessoryReps: "10–12",
      rest: "75s",
      cardioMinutes: 22,
    },
    high: {
      compoundSets: 4,
      accessorySets: 3,
      compoundReps: g === "strength" ? "4–6" : "8–12",
      accessoryReps: "12–15",
      rest: "60s",
      cardioMinutes: 30,
    },
  };
  return base[intensity] ?? base.medium;
}

function pick(pool: Move[], seed: number, count: number, from = 0): Move[] {
  const out: Move[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(seed + from + i * 2) % pool.length]);
  }
  return out;
}

function buildDay(
  day: number,
  label: string,
  focus: string,
  moves: Move[],
  spec: IntensitySpec,
  warmup: string,
  cooldown: string,
  primaryIsCompound = true,
): WorkoutDay {
  return {
    day,
    label,
    focus,
    warmup,
    cooldown,
    exercises: moves.map((m, i) => ({
      name: m.name,
      sets: primaryIsCompound && i === 0 ? spec.compoundSets : Math.max(2, spec.accessorySets),
      reps: primaryIsCompound && i === 0 ? spec.compoundReps : spec.accessoryReps,
      rest: spec.rest,
      notes: m.notes,
    })),
  };
}

function cardioDay(day: number, spec: IntensitySpec, g: string): WorkoutDay {
  const burn = g === "fat" || g === "endurance";
  return {
    day,
    label: burn ? "Engine Builder" : "Conditioning & Core",
    focus: burn ? "Cardio capacity + core" : "Core stability + aerobic base",
    warmup: "5 min easy jog + leg swings + torso rotations.",
    cooldown: "5 min walk + hip flexor and hamstring stretch.",
    exercises: [
      {
        name: burn ? "Zone-2 Cardio (run / row / cycle)" : "Incline Treadmill Walk",
        sets: 1,
        reps: `${spec.cardioMinutes} min`,
        rest: "—",
        notes: "Conversational pace",
      },
      { name: "Plank", sets: spec.accessorySets, reps: "40s hold", rest: "45s" },
      { name: "Hanging Knee Raises", sets: spec.accessorySets, reps: "10", rest: "45s" },
      { name: "Mountain Climbers", sets: spec.accessorySets, reps: "30s", rest: "45s" },
      { name: "Russian Twists", sets: 2, reps: "16", rest: "45s" },
    ],
  };
}

export function generateLocalPlan(profile: AthleteProfile): WorkoutPlan {
  const g = goalKey(profile.goal);
  const seed = hashSeed(profile.code + profile.goal);
  const spec = intensitySpec(profile.intensity, profile.goal);

  const warm = "5–10 min light cardio + dynamic stretches (arm circles, hip openers).";
  const cool = "5 min static stretching focused on the muscles trained + box breathing.";

  let days: WorkoutDay[];
  switch (g) {
    case "muscle":
    case "strength":
      days = [
        buildDay(1, "Upper Push", "Chest · shoulders · triceps", pick(PUSH, seed, 5), spec, warm, cool),
        buildDay(2, "Upper Pull", "Back · rear delts · biceps", pick(PULL, seed, 5), spec, warm, cool),
        buildDay(3, "Lower Body", "Quads · glutes · calves", pick(LEGS, seed, 5), spec, warm, cool),
        cardioDay(4, spec, g),
        buildDay(5, "Push Volume", "Chest · shoulders · triceps", pick(PUSH, seed, 5, 3), spec, warm, cool),
        buildDay(6, "Pull + Posterior", "Back · hamstrings", [...pick(PULL, seed, 3, 2), ...pick(LEGS, seed, 2, 1)], spec, warm, cool),
        buildDay(7, "Active Recovery", "Mobility + blood flow", pick(MOBILITY, seed, 4), { ...spec, rest: "30s" }, "3 min easy walk + deep breathing.", "10 min full-body stretch sequence.", false),
      ];
      break;
    case "fat":
      days = [
        buildDay(1, "Full-Body Strength A", "Compound lifts", [...pick(PUSH, seed, 2), ...pick(LEGS, seed, 2), ...pick(PULL, seed, 1)], spec, warm, cool),
        cardioDay(2, spec, g),
        buildDay(3, "Full-Body Strength B", "Compound lifts", [...pick(PULL, seed, 2, 1), ...pick(PUSH, seed, 2, 2), ...pick(LEGS, seed, 1, 3)], spec, warm, cool),
        buildDay(4, "Metabolic Circuit", "Whole body burn", [...pick(CARDIO, seed, 3), ...pick(CORE, seed, 2)], { ...spec, rest: "45s" }, warm, cool, false),
        cardioDay(5, spec, g),
        buildDay(6, "Full-Body Strength C", "Hypertrophy finishers", [...pick(LEGS, seed, 2, 4), ...pick(PUSH, seed, 2, 4), ...pick(CORE, seed, 1)], spec, warm, cool),
        buildDay(7, "Recovery + Mobility", "Hips · spine · shoulders", pick(MOBILITY, seed, 5, 1), { ...spec, rest: "30s" }, "3 min easy walk.", "10 min stretch + 5 min diaphragmatic breathing.", false),
      ];
      break;
    case "endurance":
      days = [
        cardioDay(1, { ...spec, cardioMinutes: spec.cardioMinutes + 8 }, g),
        buildDay(2, "Strength Base", "Full body", [...pick(LEGS, seed, 2), ...pick(PUSH, seed, 2), ...pick(PULL, seed, 1)], spec, warm, cool),
        cardioDay(3, spec, g),
        buildDay(4, "Mobility + Core", "Durability", [...pick(MOBILITY, seed, 3), ...pick(CORE, seed, 2)], { ...spec, rest: "30s" }, "3 min easy cycle.", "8 min stretching.", false),
        cardioDay(5, spec, g),
        buildDay(6, "Long Slow Distance", "Aerobic engine", [{ name: "Zone-2 Run / Ride", notes: "Keep heart rate steady" }], { ...spec, rest: "—" }, "8 min progressive warm-up jog.", "10 min walk + calves/hips stretch.", false),
        buildDay(7, "Recovery", "Regeneration", pick(MOBILITY, seed, 4, 2), { ...spec, rest: "30s" }, "5 min walk.", "15 min yoga flow.", false),
      ];
      break;
    case "mobility":
      days = Array.from({ length: 7 }, (_, i) =>
        buildDay(
          i + 1,
          i === 6 ? "Full Restoration" : ["Hips + Spine", "Shoulders + T-Spine", "Ankles + Hips", "Deep Core + Breath", "Posterior Chain", "Global Flow"][i]!,
          "Mobility + control",
          [...pick(MOBILITY, seed, 4, i), ...pick(CORE, seed, 1, i)],
          { ...spec, compoundSets: 2, accessorySets: 2, rest: "30s" },
          "4 min joint circles + cat-cow.",
          "6 min long-hold stretches + nasal breathing.",
          false,
        ),
      );
      break;
    default:
      days = [
        buildDay(1, "Full-Body A", "Balanced strength", [...pick(PUSH, seed, 2), ...pick(LEGS, seed, 2), ...pick(CORE, seed, 1)], spec, warm, cool),
        cardioDay(2, spec, g),
        buildDay(3, "Full-Body B", "Balanced strength", [...pick(PULL, seed, 2), ...pick(LEGS, seed, 2, 2), ...pick(CORE, seed, 1, 1)], spec, warm, cool),
        buildDay(4, "Mobility Reset", "Movement quality", pick(MOBILITY, seed, 5), { ...spec, rest: "30s" }, "4 min joint prep.", "8 min stretch.", false),
        cardioDay(5, spec, g),
        buildDay(6, "Full-Body C", "Mixed modal", [...pick(PUSH, seed, 1, 3), ...pick(PULL, seed, 1, 3), ...pick(LEGS, seed, 2, 4), ...pick(CORE, seed, 1, 2)], spec, warm, cool),
        buildDay(7, "Active Recovery", "Walk + stretch", pick(MOBILITY, seed, 3, 3), { ...spec, rest: "30s" }, "3 min walk.", "10 min full-body stretch.", false),
      ];
  }

  const goalLine: Record<string, string> = {
    muscle: "a progressive push/pull/legs hybrid built to maximize time under tension.",
    strength: "heavy compound-first programming with long rests and crisp bar speed.",
    fat: "strength supersets plus conditioning to elevate weekly energy burn while protecting muscle.",
    endurance: "aerobic base building paired with durability strength work.",
    mobility: "daily mobility flows that open the hips, spine and shoulders.",
    athletic: "power, strength and conditioning sequenced for transferable athleticism.",
    general: "balanced full-body strength, cardio and mobility across the week.",
  };

  return {
    title: `${profile.name.split(" ")[0]}'s 7-Day Cycle`,
    overview: `A ${profile.intensity}-intensity week engineered for "${profile.goal}" — ${goalLine[g] ?? goalLine.general} Warm up 5–10 minutes before every session and log your loads to progress week over week.`,
    days,
    coachNote: null,
  };
}

const TIPS: Record<string, string> = {
  muscle:
    "Prioritize protein density at every meal: aim for 1.6–2.2 g of protein per kg of bodyweight daily, anchored by a 30–40 g serving within two hours of training. A small calorie surplus (+200–300 kcal) with mostly whole carbs around your workouts will fuel the volume days and improve recovery between sessions.",
  fat: "Build each plate around a palm-sized lean protein, a fist of fibrous vegetables and a cupped-hand of slow carbs, and drink a full glass of water before eating. A modest 300–500 kcal daily deficit preserves muscle while cutting — pair it with 1.8+ g/kg protein so the weight you lose is fat, not strength.",
  strength:
    "Strength is built in the kitchen before the gym: eat a carb-and-protein meal 2–3 hours before heavy sessions and keep sodium and fluids consistent to support performance. Casein-rich food (Greek yogurt, cottage cheese) before bed supplies slow-release amino acids overnight when most tissue repair happens.",
  endurance:
    "Carbohydrate is your training fuel — time 30–60 g of fast carbs before longer cardio days and another 20–30 g per hour after the 60-minute mark to protect pace quality. Post-session, combine 3:1 carbs to protein within 45 minutes to restock glycogen so tomorrow's session doesn't start on empty.",
  mobility:
    "Hydration is underrated for tissue quality: fascia and cartilage glide best when you are well hydrated — target 30–35 ml of water per kg of bodyweight spread across the day. Add collagen-supporting nutrients (vitamin C with gelatin before deep stretch sessions) and plenty of omega-3s to keep inflammation in check.",
  general:
    "Keep it simple and repeatable: three structured meals with a protein anchor (eggs, tofu, chicken, legumes), two servings of fruit and a fist of vegetables at two of those meals, and water as your default drink. Consistency beats perfection — a routine you can follow on your busiest day is the one that changes your body.",
};

export function localNutritionTip(profile: AthleteProfile): string {
  const g = goalKey(profile.goal);
  return TIPS[g] ?? TIPS.general!;
}

export function reviseLocalPlan(
  profile: AthleteProfile,
  plan: WorkoutPlan,
  feedback: string,
): WorkoutPlan {
  const f = feedback.toLowerCase();
  const wantsHarder = /(too easy|easy|harder|more volume|more weight|increase|ramp|challenge|add)/.test(f);
  const wantsEasier = /(too hard|hard|difficult|pain|hurt|sore|injur|strain|exhaust|can't|cant|recover|reduce|less)/.test(f);
  const wantsShorter = /(time|long|short|busy|schedule|quicker)/.test(f);
  const moreCardio = /(cardio|conditioning|sweat|stamina)/.test(f);

  const days = plan.days.map((d) => {
    const exercises = d.exercises.map((e) => {
      const next = { ...e };
      if (wantsHarder) {
        next.sets = Math.min(6, e.sets + 1);
        next.rest = e.rest === "—" ? e.rest : "60s";
        next.notes = next.notes ?? "Progress the load ~5%";
      } else if (wantsEasier) {
        next.sets = Math.max(2, e.sets - 1);
        next.notes = "Leave 2–3 reps in reserve (" + (next.notes ? next.notes : "RPE ≤7") + ")";
      }
      return next;
    });
    let trimmed = exercises;
    if (wantsShorter) trimmed = exercises.slice(0, Math.max(3, exercises.length - 2));
    const out = { ...d, exercises: trimmed };
    if (moreCardio && /recovery|mobility|core/i.test(d.label)) {
      out.exercises = [
        ...trimmed,
        { name: "Rowing Machine Intervals", sets: 6, reps: "250 m fast / 90s easy", rest: "—", notes: "Added per your feedback" },
      ];
    }
    return out;
  });

  const noteParts: string[] = [];
  if (wantsHarder) noteParts.push("added a working set and shortened rests to raise the stimulus");
  else if (wantsEasier) noteParts.push("reduced volume and added reps-in-reserve guidance to manage fatigue");
  if (wantsShorter) noteParts.push("trimmed accessory work so sessions fit your schedule");
  if (moreCardio) noteParts.push("conditioning intervals added on recovery days");

  return {
    ...plan,
    days,
    coachNote: `Revised after your feedback — ${noteParts.length ? `we ${noteParts.join(", ")}` : "we refined exercise selection and cues"}. Re-check how each session feels and keep the feedback coming.`,
  };
}
