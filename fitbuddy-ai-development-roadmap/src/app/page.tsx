import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  ClipboardList,
  Cpu,
  Database,
  MessagesSquare,
  RefreshCw,
  Salad,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "@/components/marquee";
import PlanForm from "@/components/plan-form";
import Reveal from "@/components/reveal";
import SiteNav from "@/components/site-nav";

const STATS = [
  { value: "7-DAY", label: "Structured training splits" },
  { value: "02", label: "Gemini models in the loop" },
  { value: "1:1", label: "Plans adapt to your feedback" },
];

const PROTOCOL_STEPS = [
  {
    icon: BrainCircuit,
    step: "Step 01",
    title: "Structured generation",
    body: "Your metrics go straight to Gemini Pro. It returns a schema-locked 7-day split — warm-ups, sets × reps, rest windows, cooldowns. Nothing hand-wavy.",
  },
  {
    icon: Salad,
    step: "Step 02",
    title: "Nutrition intel",
    body: "Gemini Flash fires in parallel with a goal-aligned tip: protein targets, hydration, nutrient timing. Fast, lightweight, immediately actionable.",
  },
  {
    icon: RefreshCw,
    step: "Step 03",
    title: "Adaptive revisions",
    body: "Tell the coach how the week felt. Gemini Pro re-compiles the plan against your feedback and bumps the revision counter — the original stays on file.",
  },
];

const FLOW_POINTS = [
  {
    icon: ClipboardList,
    title: "Athlete file created",
    body: "Your ID is the key — come back any time and pull your plan.",
  },
  {
    icon: Cpu,
    title: "Two model calls, one click",
    body: "Pro and Flash fire in parallel. The week lands in seconds.",
  },
  {
    icon: Database,
    title: "Persisted to Postgres",
    body: "Plans, tips and every revision — nothing lives in a cookie.",
  },
  {
    icon: MessagesSquare,
    title: "Talk back to the AI",
    body: "Each piece of feedback re-compiles the week around you.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        {/* ------------------------------------------------ HERO */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="u-blueprint absolute inset-0 [mask-image:linear-gradient(to_bottom,black_30%,transparent_75%)]" />
          <div className="relative mx-auto grid max-w-7xl lg:grid-cols-12">
            <div className="col-span-12 px-5 pt-32 pb-14 sm:px-8 lg:col-span-7 lg:pt-44 lg:pb-24">
              <Reveal>
                <span className="chip">
                  <span className="size-1.5 rounded-full bg-volt animate-pulse-dot" />
                  Google Gemini-powered // Fitness intelligence
                </span>
              </Reveal>
              <Reveal delay={90}>
                <h1 className="mt-8 font-display text-[clamp(4.5rem,11vw,10.5rem)] uppercase leading-[0.86] tracking-tight">
                  <span className="block">Train.</span>
                  <span className="block text-volt">Eat.</span>
                  <span className="outline-word block">Adapt.</span>
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="mt-8 max-w-md text-balance text-sm leading-relaxed text-ash sm:text-base">
                  FitBuddy is a personal trainer that never sleeps. Two Gemini models
                  build your 7-day workout cycle and nutrition intel — then rebuild the
                  plan every time you talk back.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link href="#generate" className="btn-volt">
                    Generate my plan
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/admin" className="btn-ghost">
                    Admin panel
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="relative col-span-12 min-h-80 border-t border-line lg:col-span-5 lg:min-h-full lg:border-t-0 lg:border-l">
              <Image
                src="/images/hero-gym.jpg"
                alt="Athlete training under volt-green light in a dark gym"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="animate-drift object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/30" />
              <div className="absolute inset-0 bg-volt/10 mix-blend-overlay" />
              <p className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
                Athlete // Rim-lit // Day 01
              </p>
              <p className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-[0.2em] text-volt">
                FB-PROTOCOL v2.6
              </p>
            </div>
          </div>

          <div className="relative border-t border-line bg-void/60">
            <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {STATS.map((stat) => (
                <div key={stat.label} className="px-5 py-6 sm:px-8">
                  <p className="font-mono text-xl font-bold text-volt sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Marquee />

        {/* ------------------------------------------------ PROTOCOL */}
        <section id="protocol" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <Reveal>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-volt">
                    System // How it works
                  </p>
                  <h2 className="mt-4 font-display text-5xl uppercase leading-[0.92] sm:text-7xl">
                    The
                    <br />
                    Protocol
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <p className="max-w-sm text-sm leading-relaxed text-ash">
                  One model reasons about your training week. A second keeps your fuel
                  on target. Your feedback closes the loop. That&apos;s the whole protocol —
                  and it compounds.
                </p>
              </Reveal>
            </div>

            <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
              {PROTOCOL_STEPS.map((step, index) => (
                <Reveal key={step.title} delay={index * 110} className="bg-panel">
                  <article className="group h-full p-8 transition-colors duration-300 hover:bg-panel-2 sm:p-10">
                    <span className="grid size-12 place-items-center border border-line text-volt transition-colors duration-300 group-hover:border-volt group-hover:bg-volt group-hover:text-[#0b0d05]">
                      <step.icon className="size-5" strokeWidth={2} />
                    </span>
                    <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
                      {step.step}
                    </p>
                    <h3 className="mt-2 font-display text-2xl uppercase tracking-wide">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-ash">{step.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ GENERATOR */}
        <section id="generate" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-volt">
                  Intake // Athlete file
                </p>
                <h2 className="mt-4 font-display text-5xl uppercase leading-[0.92] sm:text-6xl">
                  Input
                  <br />
                  your
                  <br />
                  metrics<span className="text-volt">.</span>
                </h2>
              </Reveal>
              <Reveal delay={110}>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-ash">
                  Six fields. That&apos;s all the AI needs to architect a week of
                  training and fuel that actually fits your body and your schedule.
                </p>
              </Reveal>
              <div className="mt-10 space-y-6">
                {FLOW_POINTS.map((point, index) => (
                  <Reveal key={point.title} delay={170 + index * 80}>
                    <div className="flex items-start gap-4">
                      <span className="grid size-10 shrink-0 place-items-center border border-line text-volt">
                        <point.icon className="size-4" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-bone">
                          {point.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ash">
                          {point.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={140} className="lg:col-span-7">
              <div className="panel">
                <div className="flex items-center justify-between border-b border-line px-6 py-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                    Form // Athlete intake
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">
                    ~30 sec
                  </span>
                </div>
                <div className="p-6 sm:p-8">
                  <PlanForm />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------ FOOTER */}
      <footer className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-8 sm:px-8">
          <h2
            aria-hidden
            className="outline-word text-center font-display text-[clamp(4rem,18vw,17rem)] leading-[0.82] uppercase select-none"
          >
            Fitbuddy
          </h2>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ash sm:flex-row">
            <span>© 2026 Fitbuddy Systems</span>
            <span className="text-center">
              Gemini Pro × Gemini Flash × Next.js × Postgres
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-volt"
            >
              Admin view
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
