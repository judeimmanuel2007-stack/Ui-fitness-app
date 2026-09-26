import DeleteUserButton from "@/components/delete-user-button";
import Reveal from "@/components/reveal";
import { db } from "@/db";
import { plans, users } from "@/db/schema";
import { INTENSITY_LABELS, isIntensity } from "@/lib/fitness";
import { desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Cpu,
  FileText,
  MessagesSquare,
  Salad,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Athlete Registry · FitBuddy",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminPage() {
  const rows = await db
    .select({ user: users, plan: plans })
    .from(users)
    .leftJoin(plans, eq(plans.userId, users.id))
    .orderBy(desc(users.createdAt));

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash transition-colors hover:text-volt"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <span className="font-display text-lg tracking-wide">
            FITBUDDY<span className="text-volt">.</span>
          </span>
          <Link
            href="/#generate"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ash transition-colors hover:text-volt"
          >
            Intake
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <section className="border-b border-line py-12">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-volt">
              <ShieldCheck className="size-3.5" />
              Admin view // Full registry
            </p>
            <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] sm:text-8xl">
              Athlete
              <span className="text-volt"> Registry</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ash">
              Every user, their original AI plan, feedback-driven revisions and
              nutrition intel — one transparent control room for coaches and
              institutions.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="chip">
                <UserRound className="size-3" />
                {rows.length} {rows.length === 1 ? "athlete" : "athletes"} on file
              </span>
            </div>
          </Reveal>
        </section>

        {rows.length === 0 ? (
          <div className="grid place-items-center py-28 text-center">
            <Reveal>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
                Registry empty
              </p>
              <h2 className="mt-4 font-display text-4xl uppercase sm:text-5xl">
                No athletes yet<span className="text-volt">.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm text-ash">
                Generate the first plan from the intake form and it will appear here
                with full revision history.
              </p>
              <Link href="/#generate" className="btn-volt mt-8">
                Generate first plan
                <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        ) : (
          <ul className="grid gap-5 py-10 lg:grid-cols-2">
            {rows.map(({ user, plan }, index) => {
              const intensityLabel = isIntensity(user.intensity)
                ? INTENSITY_LABELS[user.intensity]
                : user.intensity;
              const feedbackCount = plan?.feedbackLog?.length ?? 0;
              const lastFeedback = feedbackCount
                ? plan!.feedbackLog[plan!.feedbackLog.length - 1]
                : null;
              return (
                <Reveal key={user.id} delay={Math.min(index, 4) * 70} className="h-full">
                  <li className="panel flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                      <div>
                        <h2 className="font-display text-2xl uppercase tracking-wide">
                          {user.name}
                        </h2>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                          ID // {user.code}
                        </p>
                      </div>
                      <span className="chip shrink-0">
                        <Calendar className="size-3" />
                        {dateFmt.format(new Date(user.createdAt))}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 px-6 pt-5">
                      <span className="chip">{user.goal}</span>
                      <span className="chip">{intensityLabel}</span>
                      <span className="chip">Age {user.age}</span>
                      <span className="chip">{user.weightKg} kg</span>
                    </div>

                    {plan ? (
                      <div className="flex flex-1 flex-col gap-4 px-6 py-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                            <FileText className="size-3.5 text-volt" />
                            {plan.currentPlan.title}
                          </p>
                          <span
                            className={`chip shrink-0 ${
                              plan.aiSource === "gemini"
                                ? "border-volt/50 text-volt"
                                : "border-ember/50 text-ember"
                            }`}
                          >
                            <Cpu className="size-3" />
                            {plan.aiModel}
                          </span>
                        </div>

                        <div className="grid gap-2 border border-line bg-panel-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                          <p className="flex justify-between gap-4">
                            <span className="text-ash">Original // Rev 00</span>
                            <span className="text-right text-bone/80">
                              {plan.originalPlan.title}
                            </span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-ash">
                              Current // Rev {String(plan.revision).padStart(2, "0")}
                            </span>
                            <span className="text-right text-volt">
                              {plan.currentPlan.title}
                            </span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-ash">Sessions</span>
                            <span className="text-bone/80">
                              {plan.currentPlan.days.length} days programmed
                            </span>
                          </p>
                        </div>

                        <p className="flex items-start gap-2 text-xs leading-relaxed text-ash">
                          <Salad className="mt-0.5 size-3.5 shrink-0 text-volt" />
                          <span className="line-clamp-3">{plan.nutritionTip}</span>
                        </p>

                        <p className="flex items-start gap-2 text-xs leading-relaxed text-ash">
                          <MessagesSquare className="mt-0.5 size-3.5 shrink-0 text-ember" />
                          {feedbackCount === 0 ? (
                            "No feedback submitted yet."
                          ) : (
                            <span className="line-clamp-2">
                              {feedbackCount}{" "}
                              {feedbackCount === 1 ? "revision" : "revisions"} — latest:
                              &ldquo;{lastFeedback?.feedback}&rdquo;
                            </span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="px-6 py-5 font-mono text-xs uppercase tracking-[0.16em] text-ash">
                        No plan generated yet.
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
                      <Link
                        href={`/plan/${encodeURIComponent(user.code)}`}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-volt"
                      >
                        View file
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                      <DeleteUserButton id={user.id} name={user.name} />
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
