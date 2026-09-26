"use client";

import { useId, useState } from "react";
import { Eye } from "@phosphor-icons/react";

export interface SourceGroup {
  system: string;
  label: string;
  count: number;
  sources: string[];
}

/** Eye icon: hover or focus reveals the connected sources in read order. */
export function SourcePeek({ groups }: { groups: SourceGroup[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label="Show connected sources"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="pressable grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-canvas hover:text-ink"
      >
        <Eye aria-hidden="true" size={16} />
      </button>
      {open && (
        <div
          id={id}
          role="tooltip"
          className="animate-rise absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-line bg-surface p-4 text-left shadow-lg"
        >
          <p className="text-xs font-semibold">Connected sources, in read order</p>
          <ol className="mt-2 space-y-2">
            {groups.map((g, i) => (
              <li key={g.system} className="flex items-start gap-3 text-sm">
                <span className="w-5 shrink-0 font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{g.label}</span>
                    <span className="font-mono text-xs tabular-nums text-ink-faint">{g.count} records</span>
                  </div>
                  <p className="truncate text-xs text-ink-faint" title={g.sources.join(", ")}>
                    {g.sources.slice(0, 3).join(" · ")}
                    {g.sources.length > 3 ? ` +${g.sources.length - 3}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-ink-faint">Simulated integrations. Nothing is written back.</p>
        </div>
      )}
    </div>
  );
}
