import { Dumbbell } from "lucide-react";
import Link from "next/link";

const DEFAULT_ITEMS = [
  { href: "/#protocol", label: "Protocol" },
  { href: "/#generate", label: "Generate" },
  { href: "/admin", label: "Admin" },
];

export default function SiteNav({
  items = DEFAULT_ITEMS,
}: {
  items?: { href: string; label: string }[];
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-void/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-9 place-items-center bg-volt text-[#0b0d05] transition-transform duration-300 group-hover:-rotate-8">
            <Dumbbell className="size-5" strokeWidth={2.75} />
          </span>
          <span className="font-display text-xl tracking-wide">
            FITBUDDY<span className="text-volt">.</span>
          </span>
        </Link>
        <nav className="flex items-center">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash transition-colors hover:text-volt sm:px-3.5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
