/**
 * SKYNET mark: a node network resolving into one point of view — many sources,
 * one picture. Geometric, single colour, reads at 16px.
 */
export function SkynetMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <g stroke="white" strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 16L8.5 9.5M16 16l7.5-6.5M16 16l-6 8M16 16l6 8" />
      </g>
      <g fill="white">
        <circle cx="16" cy="16" r="3.2" />
        <circle cx="8.5" cy="9.5" r="1.9" />
        <circle cx="23.5" cy="9.5" r="1.9" />
        <circle cx="10" cy="24" r="1.9" />
        <circle cx="22" cy="24" r="1.9" />
      </g>
    </svg>
  );
}

export function SkynetWordmark({ subtitle }: { subtitle?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <SkynetMark size={32} className="text-ink" />
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-[0.12em]">SKYNET</span>
        {subtitle && <span className="mt-0.5 block text-[11px] text-ink-faint">{subtitle}</span>}
      </span>
    </span>
  );
}
