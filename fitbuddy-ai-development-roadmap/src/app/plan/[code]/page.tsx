import FeedbackForm from "@/components/feedback-form";
import Reveal from "@/components/reveal";
import { db } from "@/db";
import {
  plans,
  users,
  type WorkoutDay,
  type WorkoutPlan,
} from "@/db/schema";
import {
  INTENSITY_LABELS,
  isIntensity,
} from "@/lib/fitness";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowUpRight,
  Cpu,
  FileClock,
  Flame,
  GitCompareArrows,
  MessagesSquare,
  Salad,
  Snowflake,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

async function loadAthlete(code: string) {
  const rows = await db
    .select({ user: users, plan: plans })
    .from(users)
    .innerJoin(plans, eq(plans.userId, users.id))
    .where(eq(users.code, code))
    .limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return { title: `${code.toUpperCase()} — Athlete File · FitBuddy` };
}

function DayCard({ day, index }: { day: WorkoutDay; index: number }) {
  return (
    <Reveal delay={Math.min(index, 6) * 70} className="h-full">
      <article className="panel flex h-full flex-col transition-colors duration-300 hover:border-volt/50">
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
              Day {String(day.day).padStart(2, "0")}
            </p>
            <h3 className="mt-1 font-display text-xl uppercase tracking-wide">
              {day.label}
            </h3>
          </div>
          <span className="chip max-w-40 shrink-0 truncate">{day.focus}</span>
        </header>
        <div className="flex-1 px-5 py-4">
          <p className="flex gap-2 text-xs leading-relaxed text-ash">
            <Flame className="mt-0.5 size-3.5 shrink-0 text-ember" />
            {day.warmup}
          </p>
          <ul className="mt-4 divide-y divide-line/60">
            {day.exercises.map((exercise, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-bone">{exercise.name}</p>
                  {exercise.notes && (
                    <p className="mt-0.5 text-xs text-ash">{exercise.notes}</p>
                  )}
                </div>
                <div className="shrink-0 text-right font-mono text-xs">
                  <p className="font-bold whitespace-nowrap text-volt">
                    {exercise.sets} × {exercise.reps}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ash">
                    rest {exercise.rest}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <footer className="border-t border-line px-5 py-3.5">
          <p className="flex gap-2 text-xs leading-relaxed text-ash">
            <Snowflake className="mt-0.5 size-3.5 shrink-0 text-volt" />
            {day.cooldown}
          </p>
        </footer>
      </article>
    </Reveal>
  );
}

function PlanTag({ plan, tone }: { plan: WorkoutPlan; tone: "muted" | "volt" }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
      <GitCompareArrows
        className={`size-3.5 ${tone === "volt" ? "text-volt" : "text-ash"}`}
      />
      <span className="text-ash">{tone === "volt" ? "Current" : "Original"}</span>
      <span className={tone === "volt" ? "text-bone" : "text-ash"}>{plan.title}</span>
    </p>
  );
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const row = await loadAthlete(code);
  if (!row) notFound();

  const { user, plan } = row;
  const current = plan.currentPlan;
  const intensityLabel = isIntensity(user.intensity)
    ? INTENSITY_LABELS[user.intensity]
    : user.intensity;
  const log = [...(plan.feedbackLog ?? [])].reverse();

  return (
    <div className="min-h-screen">
      {/* Slim header — back to intake / admin */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/#generate"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash transition-colors hover:text-volt"
          >
            <ArrowLeft className="size-4" />
            New athlete
          </Link>
          <span className="font-display text-lg tracking-wide">
            FITBUDDY<span className="text-volt">.</span>
          </span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ash transition-colors hover:text-volt"
          >
            Admin
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        {/* ------------------------------------------ ATHLETE BLOCK */}
        <section className="border-b border-line py-12 sm:py-16">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-volt">
              Athlete file // {user.code}
            </p>
            <h1 className="mt-4 font-display text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.9]">
              {user.name.split(" ")[0]}&apos;s
              <span className="text-volt"> Cycle</span>
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-ash">
              {current.title}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="chip">Goal · {user.goal}</span>
              <span className="chip">Intensity · {intensityLabel}</span>
              <span className="chip">Age · {user.age}</span>
              <span className="chip">{user.weightKg} kg</span>
              <span className="chip">Rev {String(plan.revision).padStart(2, "0")}</span>
              {plan.aiSource === "gemini" ? (
                <span className="chip border-volt/50 text-volt">
                  <Cpu className="size-3" />
                  {plan.aiModel}
                </span>
              ) : (
                <span className="chip border-ember/50 text-ember">
                  <Cpu className="size-3" />
                  Local mode — set GOOGLE_API_KEY
                </span>
              )}
            </div>
          </Reveal>
        </section>

        {/* ------------------------------------------ BRIEFING ROW */}
        <section className="grid gap-5 border-b border-line py-10 lg:grid-cols-3">
          <Reveal className="h-full">
            <div className="flex h-full flex-col bg-volt p-7 text-[#0b0d05]">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
                  Flash // Nutrition intel
                </p>
                <Salad className="size-5" strokeWidth={2.25} />
              </div>
              <p className="mt-5 flex-1 text-sm leading-relaxed font-medium">
                {plan.nutritionTip}
              </p>
            </div>
          </Reveal>
          <Reveal delay={110} className="h-full lg:col-span-2">
            <div className="panel h-full p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                  Pro // Week briefing
                </p>
                <div className="hidden gap-6 sm:flex">
                  <PlanTag plan={plan.originalPlan} tone="muted" />
                  {plan.revision > 0 && <PlanTag plan={current} tone="volt" />}
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-bone/85">
                {current.overview}
              </p>
              {plan.revision > 0 && current.coachNote && (
                <div className="mt-5 border-t border-line pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
                    Coach note // Rev {String(plan.revision).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ash">
                    {current.coachNote}
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* ------------------------------------------ THE WEEK */}
        <section className="py-12">
          <Reveal>
            <div className="flex items-end justify-between border-b border-line pb-4">
              <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
                The week <span className="text-volt">//</span>{" "}
                {String(current.days.length).padStart(2, "0")} sessions
              </h2>
              <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ash sm:block">
                sets × reps · rest
              </p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {current.days.map((day, index) => (
              <DayCard key={`${day.day}-${index}`} day={day} index={index} />
            ))}
            {/* Coach feedback tile completes the grid */}
            <Reveal delay={Math.min(current.days.length, 6) * 70} className="h-full">
              <div className="panel flex h-full flex-col justify-between gap-8 border-volt/60 bg-panel-2 p-7">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-volt">
                    Loop // Adaptive revision
                  </p>
                  <h3 className="mt-3 font-display text-3xl uppercase leading-none">
                    Talk to
                    <br />
                    your coach<span className="text-volt">.</span>
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ash">
                    Tell FitBuddy what felt too easy, too brutal or just wrong. Gemini
                    Pro re-compiles this exact week against your feedback — the
                    original plan stays frozen in the archive.
                  </p>
                </div>
                <FeedbackForm code={user.code} revision={plan.revision} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------ REVISION HISTORY */}
        {log.length > 0 && (
          <section className="border-t border-line pt-10">
            <Reveal>
              <h2 className="flex items-center gap-3 font-display text-2xl uppercase tracking-wide">
                <FileClock className="size-5 text-volt" />
                Revision history
              </h2>
            </Reveal>
            <ul className="mt-6 divide-y divide-line border border-line">
              {log.map((entry, index) => (
                <Reveal key={`${entry.revision}-${index}`} delay={index * 60}>
                  <li className="flex flex-col gap-2 bg-panel px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <div className="flex items-start gap-4">
                      <span className="chip shrink-0 border-volt/50 text-volt">
                        Rev {String(entry.revision).padStart(2, "0")}
                      </span>
                      <p className="flex items-start gap-2 text-sm leading-relaxed text-bone/85">
                        <MessagesSquare className="mt-1 size-3.5 shrink-0 text-ash" />
                        {entry.feedback}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                      {dateFmt.format(new Date(entry.at))}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-16 flex flex-col items-center gap-3 border-t border-line pt-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
          <p>
            Generated {dateFmt.format(new Date(plan.createdAt))} · Last compiled{" "}
            {dateFmt.format(new Date(plan.updatedAt))}
          </p>
          <p>
            Bookmark this URL — your athlete ID{" "}
            <span className="text-volt">{user.code}</span> retrieves this file.
          </p>
        </footer>
      </main>
    </div>
  );
}
