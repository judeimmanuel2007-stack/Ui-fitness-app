"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteUserButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (busy) return;
    if (!window.confirm(`Delete athlete "${name}" and their plan? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="inline-flex items-center gap-2 border border-ember/40 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ember transition-colors hover:bg-ember hover:text-[#12060a] disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      Delete
    </button>
  );
}
