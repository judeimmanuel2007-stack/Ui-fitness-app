import { Asterisk } from "lucide-react";

const WORDS = [
  "Build strength",
  "Fuel smart",
  "Recover deep",
  "Adapt weekly",
  "Gemini Pro",
  "Gemini Flash",
  "7-day cycles",
  "Feedback loops",
];

function Row({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {WORDS.map((word) => (
        <span key={word} className="flex items-center">
          <span className="px-6 font-display text-lg uppercase tracking-wider text-bone/85">
            {word}
          </span>
          <Asterisk className="size-4 text-volt" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-line bg-panel py-4">
      <div className="marquee-track flex w-max">
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
