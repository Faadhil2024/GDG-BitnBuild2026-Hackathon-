import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Confidence, Direction, Employee, Grade, Level } from "@/lib/types";
import { avatarUrl } from "@/lib/avatar";

/** Stock portrait, decorative (the name is always printed beside it). */
export function Avatar({ employee, size = 40, className = "" }: { employee: Pick<Employee, "id" | "name">; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl(employee)} alt="" width={size} height={size} loading="lazy" className={`shrink-0 rounded-full border border-line bg-canvas object-cover ${className}`} style={{ width: size, height: size }} />
  );
}

/** Grade bands share a colour: A = green, B = blue, C = amber, D = red. Colour never appears without the letter. */
export function gradeTone(grade: Grade) {
  return grade.startsWith("A") ? "bg-high text-white" : grade.startsWith("B") ? "bg-accent text-white" : grade.startsWith("C") ? "bg-moderate text-white" : "bg-low text-white";
}

export function GradeBadge({ grade, size = "md", label = "grade" }: { grade: Grade; size?: "sm" | "md" | "lg"; label?: string | null }) {
  const sz = { sm: "h-7 min-w-7 px-2 text-sm", md: "h-9 min-w-9 px-2.5 text-lg", lg: "h-14 min-w-14 px-4 text-3xl" }[size];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-flex items-center justify-center rounded-md font-bold tabular-nums tracking-tight shadow-sm ${gradeTone(grade)} ${sz}`}>
        <span className="sr-only">Grade </span>
        {grade}
      </span>
      {label && <span className={`text-ink-muted ${size === "lg" ? "text-base" : "text-xs"}`}>{label}</span>}
    </span>
  );
}

export function LevelBadge({ level, size = "md" }: { level: Level; size?: "sm" | "md" | "lg" }) {
  const tone = { Low: "bg-low text-white", Moderate: "bg-moderate text-white", High: "bg-high text-white" }[level];
  const sz = { sm: "text-xs px-2.5 py-1", md: "text-sm px-3 py-1.5", lg: "text-xl px-5 py-2.5" }[size];
  return (
    <span className={`inline-flex items-center rounded-md font-bold tracking-tight shadow-sm ${tone} ${sz}`}>
      {level}
      <span className="ml-2 font-normal opacity-80" style={{ fontSize: "0.62em" }}>
        contribution
      </span>
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "low" | "moderate" | "high" | "frozen" | "na" }) {
  const cls = {
    neutral: "bg-surface text-ink-muted border-line",
    accent: "bg-accent-soft text-accent border-transparent",
    low: "bg-low-soft text-low border-transparent",
    moderate: "bg-moderate-soft text-moderate border-transparent",
    high: "bg-high-soft text-high border-transparent",
    frozen: "bg-frozen-soft text-frozen border-transparent",
    na: "bg-na-soft text-na border-transparent",
  }[tone];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>;
}

export function DirectionPill({ direction }: { direction: Direction }) {
  const map: Record<Direction, { label: string; tone: "high" | "low" | "neutral" | "na"; glyph: string }> = {
    strengthens: { label: "Strengthens", tone: "high", glyph: "+" },
    weakens: { label: "Weakens", tone: "low", glyph: "−" },
    neutral: { label: "Neutral", tone: "neutral", glyph: "○" },
    irrelevant: { label: "Not applicable", tone: "na", glyph: "∅" },
  };
  const m = map[direction];
  return (
    <Pill tone={m.tone}>
      <span aria-hidden="true" className="font-mono">{m.glyph}</span> {m.label}
    </Pill>
  );
}

export function ConfidencePill({ confidence }: { confidence: Confidence }) {
  const dots = { high: "●●●", medium: "●●○", low: "●○○" }[confidence];
  return (
    <Pill tone="neutral">
      <span aria-hidden="true" className="font-mono tracking-tighter">{dots}</span> {confidence} confidence
    </Pill>
  );
}

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const base = "pressable inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";
  const v = {
    primary: "bg-accent text-white hover:bg-blue-800",
    secondary: "border border-line bg-surface text-ink hover:bg-canvas",
    ghost: "text-ink-muted hover:bg-canvas hover:text-ink",
    danger: "border border-low/30 bg-surface text-low hover:bg-low-soft",
  }[variant];
  return <button className={`${base} ${v} ${className}`} {...props} />;
}

export function Card({ children, className = "", as: Tag = "section", ...rest }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" | "aside" } & Record<string, unknown>) {
  return (
    <Tag className={`rounded-lg border border-line bg-surface ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ children, id, hint }: { children: ReactNode; id?: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
      <h2 id={id} className="text-sm font-semibold text-ink">
        {children}
      </h2>
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
    </div>
  );
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}