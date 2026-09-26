import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-volt">
          Error 404 // Not on file
        </p>
        <h1 className="mt-4 font-display text-7xl uppercase leading-none sm:text-9xl">
          No rep
          <span className="outline-word block">recorded.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-ash">
          That athlete file doesn&apos;t exist — the ID may be mistyped or the plan
          was deleted from the registry.
        </p>
        <Link href="/" className="btn-volt mt-8">
          <ArrowLeft className="size-4" />
          Back to intake
        </Link>
      </div>
    </div>
  );
}
