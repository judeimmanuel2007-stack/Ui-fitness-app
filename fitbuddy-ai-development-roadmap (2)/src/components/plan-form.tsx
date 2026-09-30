"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  History,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { GOAL_PRESETS, INTENSITIES, INTENSITY_LABELS, type Intensity } from "@/lib/fitness";

const PHASES = [
  "Contacting Gemini Pro",
  "Structuring your 7-day split",
  "Dialing in nutrition intel",
  "Saving your athlete file",
];

export default function PlanForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goal, setGoal] = useState<string>(GOAL_PRESETS[0]);
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("fb:lastCode");
    if (stored) setLastCode(stored);
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const id = window.setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 1600);
    return () => window.clearInterval(id);
  }, [submitting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    setPhase(0);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          age: Number(age),
          weightKg: Number(weightKg),
          goal,
          intensity,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; code?: string };
      if (!res.ok || !data.ok || !data.code) {
        setError(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }
      window.localStorage.setItem("fb:lastCode", data.code);
      router.push(`/plan/${encodeURIComponent(data.code)}`);
    } catch {
      setError("Network error — is the server running?");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fb-name" className="fb-label">Name</label>
          <input
            id="fb-name"
            className="fb-input"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="fb-code" className="fb-label">
            Athlete ID <span className="text-volt">// retrieval key</span>
          </label>
          <input
            id="fb-code"
            className="fb-input font-mono"
            placeholder="alex-01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            minLength={3}
            maxLength={64}
            pattern="[a-zA-Z0-9][a-zA-Z0-9\-_]*"
            title="Letters, numbers, dashes and underscores"
          />
        </div>
        <div>
          <label htmlFor="fb-age" className="fb-label">Age</label>
          <input
            id="fb-age"
            className="fb-input"
            placeholder="27"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            type="number"
            inputMode="numeric"
            min={10}
            max={100}
          />
        </div>
        <div>
          <label htmlFor="fb-weight" className="fb-label">Weight (kg)</label>
          <input
            id="fb-weight"
            className="fb-input"
            placeholder="72.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
            type="number"
            inputMode="decimal"
            step="0.1"
            min={20}
            max={400}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="fb-goal" className="fb-label">Fitness goal</label>
          <select
            id="fb-goal"
            className="fb-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23c8f31d%22%20stroke-width%3D%222.5%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-size-[12px] bg-position-[right_1rem_center] bg-no-repeat"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            {GOAL_PRESETS.map((preset) => (
              <option key={preset} value={preset} className="bg-panel text-bone">
                {preset}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <span className="fb-label">Workout intensity</span>
          <div className="grid grid-cols-3 border border-line">
            {INTENSITIES.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setIntensity(level)}
                className={`px-3 py-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-150 ${
                  intensity === level
                    ? "bg-volt font-bold text-[#0b0d05]"
                    : "bg-panel text-ash hover:text-bone"
                }`}
              >
                {INTENSITY_LABELS[level]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-5 flex items-center gap-2 border border-ember/40 bg-ember/10 px-4 py-3 font-mono text-xs text-ember">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-volt mt-6 w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {PHASES[phase]}&hellip;
          </>
        ) : (
          <>
            Generate plan
            <ArrowRight className="size-4" />
          </>
        )}
      </button>

      {lastCode && !submitting && (
        <Link
          href={`/plan/${encodeURIComponent(lastCode)}`}
          className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ash transition-colors hover:text-volt"
        >
          <History className="size-3.5" />
          Resume athlete file: {lastCode}
          <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </form>
  );
}
