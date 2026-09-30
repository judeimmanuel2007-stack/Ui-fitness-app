"use client";

import { CheckCircle2, CircleAlert, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "done" | "error";

export default function FeedbackForm({
  code,
  revision,
}: {
  code: string;
  revision: number;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, feedback }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; revision?: number };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Revision failed. Try again.");
        return;
      }
      setStatus("done");
      setFeedback("");
      setMessage(`Plan re-compiled — REV ${String(data.revision ?? revision + 1).padStart(2, "0")} is live above.`);
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error — is the server running?");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="fb-feedback" className="fb-label">
        Coach input <span className="text-volt">// feeds Gemini Pro</span>
      </label>
      <textarea
        id="fb-feedback"
        className="fb-input min-h-32 resize-y"
        placeholder="e.g. Day 3 legs felt too easy — add more posterior-chain volume, and I have a minor knee twinge so swap lunges for something low-impact."
        value={feedback}
        onChange={(e) => {
          setFeedback(e.target.value);
          if (status === "done" || status === "error") {
            setStatus("idle");
            setMessage(null);
          }
        }}
        maxLength={800}
        required
        minLength={3}
      />
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
        <span>{feedback.length}/800</span>
        <span>Current: REV {String(revision).padStart(2, "0")}</span>
      </div>

      {message && (
        <p
          className={`mt-4 flex items-center gap-2 border px-4 py-3 font-mono text-xs ${
            status === "error"
              ? "border-ember/40 bg-ember/10 text-ember"
              : "border-volt/40 bg-volt/10 text-volt"
          }`}
        >
          {status === "error" ? (
            <CircleAlert className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" />
          )}
          {message}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-volt mt-5 w-full sm:w-auto">
        {status === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Re-compiling plan&hellip;
          </>
        ) : (
          <>
            Re-compile my plan
            <Send className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
