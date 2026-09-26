"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Warning,
  MagnifyingGlass,
  Scales,
  FileText,
  Check,
  EyeSlash,
  Eye,
  Play,
  List,
  X,
  Robot,
  User,
  Users,
  Gavel,
  Pulse,
  ChatCircle,
  ChartBar,
  CalendarX,
  CheckCircle,
} from "@phosphor-icons/react";
import { SkynetMark } from "@/components/brand";

/* Editorial "paper" register from the landing design: warm off-white, ink, one navy, a red stamp. */
const C = {
  ink: "#15181c",
  body: "#4a443b",
  muted: "#6e675c",
  faint: "#7c7466",
  rule: "#ded8ce",
  paper: "#f7f5f1",
  paper3: "#efece5",
  navy: "#1b3a5c",
  stamp: "#b23a2e",
  verify: "#3c6b4a",
  warn: "#9a6b1c",
};

const CONTAINER = "mx-auto max-w-[1280px] px-6 md:px-10";

/* Reveal on scroll without a motion library: one class flip, transform + opacity only. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (el.classList.add("is-in"), io.disconnect())),
      { rootMargin: "-60px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Landing() {
  return (
    <div className="landing min-h-[100dvh]" style={{ background: C.paper, color: C.ink }}>
      <Nav />
      <main id="main">
        <Hero />
        <EvidenceGap />
        <HowItWorks />
        <ClosingCta />
      </main>
      <footer style={{ background: C.ink, color: C.paper }}>
        <div className={`${CONTAINER} flex items-center justify-between gap-4 py-7 text-[12px]`} style={{ color: "#9b9488" }}>
          <span className="flex items-center gap-2">
            <SkynetMark size={18} className="text-white [&_rect]:fill-white/15" /> © 2026 SKYNET
          </span>
          <span>Prototype · simulated data only · By Outsider(s)</span>
        </div>
      </footer>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [
    { label: "The problem", href: "#problem" },
    { label: "Evidence gap", href: "#gap" },
    { label: "How it works", href: "#how" },
  ];
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? "backdrop-blur" : ""}`} style={scrolled ? { background: "rgba(247,245,241,0.94)", borderBottom: `1px solid ${C.rule}` } : undefined}>
      <div className={`${CONTAINER} flex h-[68px] items-center justify-between`}>
        <a href="#top" className="flex items-center gap-2.5">
          <SkynetMark size={30} className="text-[#15181c]" />
          <span className="text-[19px] font-bold leading-none tracking-[0.14em]">SKYNET<span style={{ color: C.stamp }}>.</span></span>
        </a>
        <nav aria-label="Landing" className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="border-b border-transparent pb-0.5 text-[13.5px] font-medium transition-colors hover:border-current" style={{ color: C.body }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="pressable inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors" style={{ background: C.navy }}>
            <Play size={14} weight="fill" /> See the demo
          </Link>
        </div>
        <button type="button" className="p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>
      {open && (
        <div className="px-6 pb-6 pt-2 lg:hidden" style={{ background: C.paper, borderTop: `1px solid ${C.rule}` }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-[15px] font-medium" style={{ borderBottom: `1px solid ${C.rule}` }}>
              {l.label}
            </a>
          ))}
          <Link href="/login" className="mt-4 flex w-full items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold text-white" style={{ background: C.navy }}>
            <Play size={16} weight="fill" /> See the demo
          </Link>
        </div>
      )}
    </header>
  );
}

const initialSignals = [
  { l: "GitHub commits: 3", v: "weak", s: "neg" },
  { l: "Slack volume: low", v: "low", s: "neg" },
  { l: "Activity: 412 events", v: "−18% vs median", s: "neg" },
  { l: "Missed deadline (Mar 14)", v: "−6 pts", s: "neg" },
];
const fullSignals = [
  { l: "Influenced campaign revenue", v: "+8 pts", s: "pos" },
  { l: "Cross-functional launches", v: "+6 pts", s: "pos" },
  { l: "Client saves and touchpoints", v: "+5 pts", s: "pos" },
  { l: "Mentoring and onboarding", v: "+4 pts", s: "pos" },
  { l: "Off-channel collaboration", v: "+3 pts", s: "pos" },
  { l: "Missed deadline (Mar 14), retained", v: "−6 pts", s: "neg" },
];

function Hero() {
  const [showFull, setShowFull] = useState(false);
  const [score, setScore] = useState(32);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setShowFull((v) => !v), 5000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const target = showFull ? 58 : 32;
    let raf = 0;
    const t0 = performance.now();
    const from = score;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      setScore(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFull]);

  const tone = showFull ? C.verify : C.stamp;

  return (
    <section id="top" className="relative overflow-hidden pb-14 pt-[110px] md:pb-16 md:pt-[140px]">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div className={`relative ${CONTAINER}`}>
        <div className="grid items-start gap-12 pt-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 md:pt-10">
          <div>
            <h1 className="hero-in text-[44px] font-bold leading-[0.98] tracking-[-0.032em] md:text-[70px]">
              What if AI judged you{" "}
              <span className="line-through decoration-[4px]" style={{ color: "#9b9488", textDecorationColor: C.stamp }}>without</span>{" "}
              seeing the{" "}
              <span className="relative inline-block" style={{ color: C.navy }}>
                whole picture?
                <span aria-hidden="true" className="absolute -bottom-1.5 left-0 h-[3px] w-full" style={{ background: "rgba(27,58,92,0.25)" }} />
              </span>
            </h1>

            <p className="hero-in mt-7 max-w-[560px] text-[16px] leading-[1.65] md:text-[18px]" style={{ color: C.body, animationDelay: "80ms" }}>
              <strong className="font-semibold" style={{ color: C.ink }}>SKYNET</strong> finds the evidence AI missed, lets{" "}
              <strong className="font-semibold" style={{ color: C.ink }}>managers contest the assessment with proof</strong>, and shows exactly{" "}
              <span className="font-semibold underline underline-offset-[5px]" style={{ color: C.navy, textDecorationColor: "rgba(27,58,92,0.35)" }}>what changed, and why.</span>
            </p>

            <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "140ms" }}>
              <Link href="/login" className="pressable group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-[14.5px] font-semibold text-white transition-colors" style={{ background: C.navy }}>
                See the demo
                <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#how" className="pressable inline-flex items-center justify-center gap-2.5 border bg-white px-7 py-3.5 text-[14.5px] font-semibold transition-colors hover:border-current" style={{ borderColor: "rgba(21,24,28,0.25)", color: C.ink }}>
                <FileText size={16} /> How it works
              </a>
            </div>

            <div className="hero-in mt-9 grid grid-cols-1 gap-5 pt-5 sm:grid-cols-3 sm:gap-6" style={{ borderTop: `1px solid ${C.rule}`, animationDelay: "220ms" }}>
              {[
                { k: "Find", v: "Evidence the initial model never saw", Icon: MagnifyingGlass, tone: C.navy },
                { k: "Challenge", v: "Contest the AI with cited proof, three rounds, then human override", Icon: Scales, tone: C.warn },
                { k: "Prove", v: "Every change logged and announced, nothing quietly erased", Icon: Warning, tone: C.verify },
              ].map((s) => (
                <div key={s.k}>
                  <s.Icon size={16} style={{ color: s.tone }} className="mb-2" />
                  <div className="text-[22px] font-bold leading-none tracking-[-0.02em]">{s.k}</div>
                  <div className="mt-1.5 text-[12.5px] leading-[1.45]" style={{ color: C.muted }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment card */}
          <div className="hero-in relative lg:mt-2" style={{ animationDelay: "160ms" }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 border" style={{ borderColor: C.rule, background: C.paper3 }} />
            <div className="panel relative">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.rule}` }}>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/sarah.jpg" alt="" className="h-11 w-11 border object-cover grayscale-[35%]" style={{ borderColor: C.rule }} />
                  <div>
                    <div className="text-[15px] font-semibold leading-tight">Sarah Lim</div>
                    <div className="mt-0.5 text-[12px]" style={{ color: C.muted }}>Marketing Executive · H1 cycle</div>
                  </div>
                </div>
                <div key={String(showFull)} className="stamp stamp-in text-[13px]" style={{ color: tone }}>{showFull ? "B" : "C"}</div>
              </div>

              <div className="px-5 pt-4">
                <div role="tablist" aria-label="Evidence view" className="grid grid-cols-2 border" style={{ borderColor: C.rule, background: C.paper3 }}>
                  <button role="tab" aria-selected={!showFull} type="button" onClick={() => { setShowFull(false); setPaused(true); }} className="flex items-center justify-center gap-1.5 py-2 text-[11.5px] font-semibold transition-colors" style={{ background: !showFull ? "#fff" : "transparent", color: !showFull ? C.ink : "#7c7466", borderRight: `1px solid ${C.rule}` }}>
                    <EyeSlash size={14} /> Partial view
                  </button>
                  <button role="tab" aria-selected={showFull} type="button" onClick={() => { setShowFull(true); setPaused(true); }} className="flex items-center justify-center gap-1.5 py-2 text-[11.5px] font-semibold transition-colors" style={{ background: showFull ? C.navy : "transparent", color: showFull ? C.paper : "#7c7466" }}>
                    <Eye size={14} /> Whole picture
                  </button>
                </div>
              </div>

              <div className="px-5 pt-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="label text-[9px]" style={{ color: C.faint }}>Contribution index</div>
                    <div className="mt-2 text-[56px] font-bold leading-[0.85] tracking-[-0.035em] tabular-nums">
                      {score}<span className="text-[18px] font-medium" style={{ color: "#9b9488" }}>/100</span>
                    </div>
                  </div>
                  <div className="pb-1 text-right">
                    <div className="text-[12px] font-semibold" style={{ color: tone }}>{showFull ? "Meets bar, growth areas" : "Below contribution bar"}</div>
                    <div className="label mt-1.5 text-[9px]" style={{ color: C.faint }}>{showFull ? "9 signals · fuller coverage" : "4 signals · partial coverage"}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="relative h-2.5 border" style={{ background: C.paper3, borderColor: C.rule }}>
                    <div className="h-full transition-[width] duration-500" style={{ width: `${score}%`, background: tone }} />
                    <div aria-hidden="true" className="absolute inset-y-0 left-[40%] w-px" style={{ background: "rgba(21,24,28,0.35)" }} />
                    <div aria-hidden="true" className="absolute inset-y-0 left-[65%] w-px" style={{ background: "rgba(21,24,28,0.35)" }} />
                  </div>
                  <div className="label mt-1.5 flex justify-between text-[8.5px]" style={{ color: C.faint }}>
                    <span>0</span><span>40 · B band</span><span>65 · A band</span><span>100</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pt-5">
                <div className="label pb-1.5 text-[9px]" style={{ color: C.faint, borderBottom: `1px solid ${C.ink}` }}>Signals on record</div>
                <table className="w-full">
                  <tbody>
                    {(showFull ? fullSignals : initialSignals).map((s) => (
                      <tr key={s.l} style={{ borderBottom: `1px solid ${C.rule}` }}>
                        <td className="py-[7px] pr-3 text-[12px] leading-snug" style={{ color: C.body }}>
                          <span aria-hidden="true" className="mr-2 inline-block h-[6px] w-[6px] align-middle" style={{ background: s.s === "pos" ? C.verify : C.stamp }} />
                          {s.l}
                        </td>
                        <td className="whitespace-nowrap py-[7px] text-right text-[11px] font-semibold" style={{ color: s.s === "pos" ? C.verify : C.stamp }}>{s.v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-start gap-2.5 px-5 py-3.5 text-[12px] leading-[1.5]" style={{ borderTop: `1px solid ${C.rule}`, background: showFull ? "rgba(60,107,74,0.07)" : "rgba(178,58,46,0.07)", color: showFull ? "#2d5239" : "#8e2c22" }}>
                {showFull ? <Check size={16} weight="bold" className="mt-0.5 shrink-0" /> : <Warning size={16} className="mt-0.5 shrink-0" />}
                <span>
                  {showFull ? (
                    <><strong>Missing proofs recovered.</strong> Delivery concern retained on record, not erased.</>
                  ) : (
                    <><strong>Incomplete basis.</strong> Only part of the work surface observed. Label not yet justified.</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div id="problem" className="mt-16 scroll-mt-24 md:mt-20">
          <div className="grid gap-6 pt-7 md:grid-cols-[190px_1fr] md:gap-10" style={{ borderTop: `2px solid ${C.ink}` }}>
            <div className="label text-[9.5px]" style={{ color: C.stamp }}>The core failure mode</div>
            <p className="max-w-3xl text-[20px] font-medium leading-[1.32] tracking-[-0.015em] md:text-[28px]">
              AI can make <span style={{ color: C.stamp }}>high-impact workforce decisions</span> on{" "}
              <span className="underline decoration-2 underline-offset-[6px]" style={{ textDecorationColor: C.navy }}>incomplete data</span>, missing context, or inaccurate signals about actual work — and a confident explanation is quietly accepted as proof it was right.
            </p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px" style={{ background: C.rule }} />
    </section>
  );
}

const narrow = [
  { Icon: Pulse, label: "Activity counts", note: "Volume without type, role fit, or outcome." },
  { Icon: ChatCircle, label: "Chat volume", note: "Message count only. Ignores calls, workshops and in-person work." },
  { Icon: ChartBar, label: "Generic productivity signals", note: "Often misweighted for non-engineering roles." },
  { Icon: CalendarX, label: "Isolated incidents", note: "A single delay with no mitigating context attached." },
];
const recovered = [
  { label: "Business impact", note: "Pipeline, revenue influence, launch ownership and delivery outcomes." },
  { label: "Client and stakeholder work", note: "Relationship effort, escalations handled, accounts protected." },
  { label: "Mentoring and citizenship", note: "Onboarding, peer support and team enablement outside tracked channels." },
  { label: "Cross-functional ownership", note: "Docs, retros, workshops and coordination the first model never saw." },
  { label: "Off-channel collaboration", note: "Calendar, shared boards and work that never hit the original sensors." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-7" style={{ borderTop: `2px solid ${C.ink}` }}>
      <h2 className="text-[36px] font-bold leading-[1.02] tracking-[-0.03em] md:text-[56px]">{children}</h2>
    </div>
  );
}

function EvidenceGap() {
  return (
    <section id="gap" className="relative scroll-mt-20 pb-12 pt-16 md:pb-16 md:pt-20">
      <div className={CONTAINER}>
        <SectionTitle>01. The evidence gap</SectionTitle>
        <div className="mt-11 grid items-start gap-8 lg:grid-cols-2">
          <Reveal className="panel">
            <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: `2px solid ${C.stamp}` }}>
              <div>
                <div className="label text-[9.5px]" style={{ color: C.stamp }}>Without SKYNET</div>
                <div className="mt-1.5 text-[19px] font-semibold tracking-[-0.015em]">Partial view</div>
              </div>
              <div className="stamp px-3.5 py-1.5 text-[15px]" style={{ color: C.stamp }}>Incomplete</div>
            </div>
            <div className="px-6 py-2">
              {narrow.map((s, i) => (
                <div key={s.label} className="flex gap-4 py-4" style={{ borderBottom: i < narrow.length - 1 ? `1px solid ${C.rule}` : undefined }}>
                  <div className="label w-9 shrink-0 pt-0.5 text-[9px]" style={{ color: C.faint }}>A{i + 1}</div>
                  <s.Icon size={18} className="mt-0.5 shrink-0" style={{ color: C.stamp }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold">{s.label}</div>
                    <div className="mt-1 text-[12.5px] leading-[1.55]" style={{ color: C.muted }}>{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 text-[12.5px] leading-[1.6]" style={{ borderTop: `1px solid ${C.rule}`, background: "rgba(178,58,46,0.05)", color: "#8e2c22" }}>
              <strong className="font-semibold">Verdict basis insufficient.</strong> High-impact labels can be issued without revenue, ownership, client, mentoring or collaboration data ever being consulted.
            </div>
          </Reveal>

          <Reveal className="panel" delay={100}>
            <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: `2px solid ${C.verify}` }}>
              <div>
                <div className="label text-[9.5px]" style={{ color: C.verify }}>With SKYNET</div>
                <div className="mt-1.5 text-[19px] font-semibold tracking-[-0.015em]">Whole picture</div>
              </div>
              <div className="stamp px-3.5 py-1.5 text-[15px]" style={{ color: C.verify }}>Justified</div>
            </div>
            <div className="px-6 py-2">
              {recovered.map((e, i) => (
                <div key={e.label} className="flex gap-4 py-4" style={{ borderBottom: i < recovered.length - 1 ? `1px solid ${C.rule}` : undefined }}>
                  <div className="label w-9 shrink-0 pt-0.5 text-[9px]" style={{ color: C.faint }}>B{i + 1}</div>
                  <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0" style={{ color: C.verify }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold leading-snug">{e.label}</div>
                    <div className="mt-1.5 text-[12.5px] leading-[1.55]" style={{ color: C.muted }}>{e.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 text-[12.5px] leading-[1.6]" style={{ borderTop: `1px solid ${C.rule}`, background: "rgba(60,107,74,0.05)", color: "#2d5239" }}>
              <strong className="font-semibold">Negative signals stay on record.</strong> Recovery adds missing truth with full context. It does not rewrite history.
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", Icon: User, title: "Self-appraisal", body: "The employee submits their own account of the cycle: nine questions and a self-grade. Nothing else is asked of them." },
  { n: "02", Icon: Robot, title: "AI grade from evidence", body: "On submission the engine grades from indexed records only, then checks each claim against them: backed, unbacked or contradicted." },
  { n: "03", Icon: MagnifyingGlass, title: "Evidence recovery", body: "SKYNET reads a wider work surface for proofs the first pass missed and re-runs the grade. Concerns stay on record." },
  { n: "04", Icon: Users, title: "Manager review", body: "The manager sees self-grade, AI grade and per-question reasoning side by side, then agrees or contests with cited evidence." },
  { n: "05", Icon: Gavel, title: "Resolution", body: "Up to three rounds. If the AI holds, a signed human override becomes the decision of record, labelled as such. Nothing is silent." },
];

function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 pb-16 pt-12 md:pb-24 md:pt-16">
      <div className={CONTAINER}>
        <SectionTitle>02. How it works</SectionTitle>
        <div className="mt-10 overflow-x-auto pb-1">
          <div className="grid min-w-[960px] grid-cols-5 gap-px border lg:min-w-0" style={{ background: C.rule, borderColor: C.rule }}>
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 60} className="flex h-full flex-col bg-[#f7f5f1] p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="label text-[11px]" style={{ color: C.faint }}>{s.n}</span>
                  <s.Icon size={22} style={{ color: C.navy }} />
                </div>
                <h3 className="mt-5 text-[20px] font-semibold leading-[1.25] tracking-[-0.018em] md:text-[22px]">{s.title}</h3>
                <p className="mt-3.5 text-[15px] leading-[1.6] md:text-[16px]" style={{ color: C.body }}>{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="relative pb-20">
      <div className={CONTAINER}>
        <div className="grid items-center gap-8 px-8 py-12 md:grid-cols-[1fr_auto] md:px-12" style={{ background: C.ink, color: C.paper }}>
          <div>
            <div className="label text-[10px]" style={{ color: "#9b9488" }}>Try it</div>
            <h2 className="mt-3 max-w-[22ch] text-[30px] font-bold leading-[1.05] tracking-[-0.025em] md:text-[44px]">See the AI change its mind — and show its work.</h2>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed" style={{ color: "#c9c2b6" }}>
              Sign in as an employee to submit an appraisal, or as the manager to review, contest and decide. Four demo accounts, all simulated data.
            </p>
          </div>
          <Link href="/login" className="pressable group inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-semibold transition-colors" style={{ background: C.paper, color: C.ink }}>
            Open the demo <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
