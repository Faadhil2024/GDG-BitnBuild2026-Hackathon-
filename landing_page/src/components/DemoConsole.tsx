import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  Users,
  ScanSearch,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Gavel,
  RotateCcw,
  ShieldCheck,
  FileText,
  Link2,
  Loader2,
  ChevronRight,
  Lock,
  Eye,
} from "lucide-react";
import {
  employee,
  initialSignals,
  missedEvidence,
  initialScore,
  bandFor,
  type AuditEvent,
} from "../data/case";

const steps = [
  { id: 0, label: "AI Appraisal", sub: "Partial view", icon: Bot },
  { id: 1, label: "Evidence Recovery", sub: "Find what's missing", icon: ScanSearch },
  { id: 2, label: "Self-Appraisal", sub: "Employee side", icon: User },
  { id: 3, label: "Manager Challenge", sub: "Contest the AI", icon: Users },
  { id: 4, label: "Resolution", sub: "What changed & why", icon: Gavel },
];

type Attempt = { text: string; reason: string; passed: boolean; feedback: string };

const timeNow = () =>
  new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const kindTone: Record<AuditEvent["kind"], string> = {
  ai: "bg-[#1b3a5c]",
  evidence: "bg-[#3c6b4a]",
  employee: "bg-[#274c77]",
  manager: "bg-[#9a6b1c]",
  system: "bg-[#15181c]",
};

export default function DemoConsole() {
  const [step, setStep] = useState(0);
  const [recovered, setRecovered] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [selfScore, setSelfScore] = useState(74);
  const [selfText, setSelfText] = useState(
    "I led the Raya campaign end-to-end and co-drove PayLite v3 launch. My Salesforce attribution shows RM800k influenced revenue. I also covered client escalations and onboarded 3 new hires — none of which appears in the initial signals. The Mar 14 delay was a vendor asset block; I flagged it 6 days early and shipped the workaround."
  );
  const [managerStance, setManagerStance] = useState<"agree" | "challenge" | null>(null);
  const [challengeReason, setChallengeReason] = useState("Incomplete evidence basis");
  const [challengeEvidence, setChallengeEvidence] = useState<Set<string>>(new Set(["ev-revenue"]));
  const [challengeText, setChallengeText] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [adjudicating, setAdjudicating] = useState(false);
  const [overrideGranted, setOverrideGranted] = useState(false);
  const [challengePassed, setChallengePassed] = useState(false);
  const [audit, setAudit] = useState<AuditEvent[]>([
    {
      id: "a0",
      time: "09:41:02",
      actor: "AI Appraiser",
      action: "Initial appraisal issued",
      detail: "Score 32/100 · LOW — 4 signals, 31% coverage, confidence 0.41",
      kind: "ai",
    },
  ]);

  const recoveredList = useMemo(() => missedEvidence.filter((e) => recovered.has(e.id)), [recovered]);
  const recoveredSum = recoveredList.reduce((s, e) => s + e.impact, 0);
  const aiScore = initialScore + recoveredSum;
  const aiBand = bandFor(aiScore);
  const coverage = Math.round(31 + (recovered.size / missedEvidence.length) * 58);

  const selfBand = bandFor(selfScore);
  const finalScore = overrideGranted ? 68 : challengePassed ? 66 : aiScore;
  const finalBand = bandFor(finalScore);

  const pushAudit = (e: Omit<AuditEvent, "id" | "time">) => {
    setAudit((prev) => [...prev, { ...e, id: `a${prev.length}-${Date.now()}`, time: timeNow() }]);
  };

  const toggleRecover = (id: string) => {
    setRecovered((prev) => {
      const next = new Set(prev);
      const ev = missedEvidence.find((e) => e.id === id)!;
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        pushAudit({
          actor: "Evidence Engine",
          action: `Evidence recovered: ${ev.title}`,
          detail: `+${ev.impact} pts · Source: ${ev.source}`,
          kind: "evidence",
        });
      }
      return next;
    });
  };

  const runAutoScan = () => {
    if (scanning) return;
    setScanning(true);
    const ids = missedEvidence.map((e) => e.id);
    ids.forEach((id, i) => {
      setTimeout(() => {
        setRecovered((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        const ev = missedEvidence.find((e) => e.id === id)!;
        pushAudit({
          actor: "Evidence Engine",
          action: `Evidence recovered: ${ev.title}`,
          detail: `+${ev.impact} pts · Source: ${ev.source}`,
          kind: "evidence",
        });
        if (i === ids.length - 1) {
          setTimeout(() => {
            setScanning(false);
            pushAudit({
              actor: "AI Appraiser",
              action: "Re-appraisal issued: 58/100 · MODERATE",
              detail: "Delivery concern retained on record. Confidence 0.83 — above threshold.",
              kind: "ai",
            });
          }, 500);
        }
      }, 600 * (i + 1));
    });
  };

  const submitSelf = () => {
    pushAudit({
      actor: "Sarah Lim",
      action: `Self-appraisal submitted: ${selfScore}/100 · ${selfBand.label.toUpperCase()}`,
      detail: selfText.slice(0, 110) + (selfText.length > 110 ? "…" : ""),
      kind: "employee",
    });
    setStep(3);
  };

  const toggleChallengeEv = (id: string) => {
    setChallengeEvidence((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const evaluateChallenge = () => {
    if (adjudicating || !challengeText.trim()) return;
    setAdjudicating(true);
    setTimeout(() => {
      setAdjudicating(false);
      const n = attempts.length + 1;
      const len = challengeText.trim().length;
      const evCount = challengeEvidence.size;
      let passed = false;
      let feedback = "";

      if (len < 60) {
        feedback = `Attempt ${n} rejected: justification too vague (${len} chars). Cite specific evidence, dates and business impact. Vague disagreement is not contestation.`;
      } else if (evCount < 2) {
        feedback = `Attempt ${n} rejected: only ${evCount} evidence item attached. A valid challenge must ground itself in ≥2 verified artefacts — CRM, retros, tickets, peer review.`;
      } else if (n === 1 && len < 200) {
        feedback = `Attempt ${n} rejected: partially grounded, but no causal link shown. How does the cited evidence change the contribution assessment? Address the retained delivery concern explicitly.`;
      } else if (n === 2 && !/deadline|mar/i.test(challengeText)) {
        feedback = `Attempt ${n} rejected: stronger, but you still haven't addressed the Mar 14 delivery concern. The AI will not move while a negative signal is unacknowledged. Confront it with mitigating context.`;
      } else {
        passed = true;
        feedback = `Attempt ${n} accepted: justification is specific, multi-grounded, and addresses the retained concern. Assessment may move to the HIGH boundary with conditions.`;
      }

      setAttempts((p) => [...p, { text: challengeText, reason: challengeReason, passed, feedback }]);
      pushAudit({
        actor: n <= 3 ? "Daniel Ong" : "System",
        action: passed
          ? `Challenge accepted on attempt ${n}: ${challengeReason}`
          : `Challenge rejected on attempt ${n}: ${challengeReason}`,
        detail: feedback,
        kind: passed ? "system" : "manager",
      });
      if (passed) {
        setChallengePassed(true);
        pushAudit({
          actor: "AI Appraiser",
          action: "Revised assessment proposed: 66/100 · HIGH (conditional)",
          detail: "Conditions: delivery check-in at 30 days; evidence bundle pinned to record.",
          kind: "ai",
        });
        setTimeout(() => setStep(4), 1300);
      } else if (n >= 3) {
        pushAudit({
          actor: "System",
          action: "Human override unlocked after 3 attempts",
          detail: "AI remains accountable to human judgment — manager may override with attestation.",
          kind: "system",
        });
      }
    }, 1600);
  };

  const grantOverride = () => {
    setOverrideGranted(true);
    pushAudit({
      actor: "Daniel Ong",
      action: "Human override exercised: 68/100 · HIGH",
      detail: "Manager attestation: 'I take accountability for this judgment.' AI dissent logged.",
      kind: "manager",
    });
    setStep(4);
  };

  const reset = () => {
    setStep(0);
    setRecovered(new Set());
    setManagerStance(null);
    setAttempts([]);
    setChallengePassed(false);
    setOverrideGranted(false);
    setChallengeText("");
    setAudit([
      {
        id: "a0",
        time: "09:41:02",
        actor: "AI Appraiser",
        action: "Initial appraisal issued",
        detail: "Score 32/100 · LOW — 4 signals, 31% coverage, confidence 0.41",
        kind: "ai",
      },
    ]);
  };

  const btnPrimary =
    "inline-flex items-center gap-2 bg-[#1b3a5c] px-5 py-2.5 text-[13px] font-semibold text-[#f7f5f1] hover:bg-[#15181c] transition-colors disabled:opacity-35 disabled:hover:bg-[#1b3a5c]";
  const btnGhost =
    "inline-flex items-center gap-1.5 border border-[#15181c]/25 bg-white px-5 py-2.5 text-[13px] font-semibold text-[#15181c] hover:border-[#15181c] transition-colors";

  return (
    <section id="demo" className="relative py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="grid md:grid-cols-[190px_1fr] gap-6 md:gap-10 border-t-2 border-[#15181c] pt-7">
          <div>
            <div className="label text-[9.5px] text-[#1b3a5c]">02 — Live case console</div>
            <div className="mt-2 text-[11px] text-[#9b9488] leading-[1.5]">
              Interactive · you play all three parties
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[30px] md:text-[46px] font-bold tracking-[-0.028em] leading-[1.04] text-[#15181c]">
                The Sarah Lim case,
                <br />
                end to end.
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.65] text-[#4a443b] max-w-2xl">
                Play the <strong className="text-[#15181c] font-semibold">evidence engine</strong>, the{" "}
                <strong className="text-[#15181c] font-semibold">employee</strong>, and the{" "}
                <strong className="text-[#15181c] font-semibold">manager challenging the AI</strong>. Every
                action is written to the audit log as you go.
              </p>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 label text-[9.5px] text-[#6e675c] border border-[#ded8ce] bg-white px-4 py-2.5 hover:border-[#15181c] hover:text-[#15181c] transition-colors self-start shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset demo
            </button>
          </div>
        </div>

        {/* stepper */}
        <div className="mt-9 grid grid-cols-2 sm:grid-cols-5 border border-[#ded8ce] bg-white">
          {steps.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`relative text-left px-4 py-4 border-[#ded8ce] transition-colors ${
                  i < steps.length - 1 ? "sm:border-r" : ""
                } ${i < 4 ? "border-b sm:border-b-0" : ""} ${i % 2 === 0 ? "border-r sm:border-r" : ""} ${
                  active ? "bg-[#1b3a5c]" : done ? "bg-[#3c6b4a]/[0.08]" : "bg-white hover:bg-[#efece5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-7 w-7 flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      active
                        ? "bg-[#f7f5f1] text-[#1b3a5c]"
                        : done
                        ? "bg-[#3c6b4a] text-[#f7f5f1]"
                        : "bg-[#efece5] text-[#9b9488] border border-[#ded8ce]"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-[11.5px] font-semibold leading-tight truncate ${
                        active ? "text-[#f7f5f1]" : "text-[#15181c]"
                      }`}
                    >
                      {s.label}
                    </div>
                    <div className={`text-[10px] leading-tight truncate ${active ? "text-[#f7f5f1]/70" : "text-[#9b9488]"}`}>
                      {s.sub}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* MAIN PANEL */}
          <div className="panel min-h-[560px] relative">
            <AnimatePresence mode="wait">
              {/* STEP 0 */}
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-9"
                >
                  <div className="flex items-center gap-2 label text-[9.5px] text-[#9b9488]">
                    <Bot className="h-3.5 w-3.5 text-[#1b3a5c]" /> AI Appraiser · model v4.2 · H1 2026 cycle
                  </div>
                  <h3 className="mt-3 text-[24px] md:text-[30px] font-bold tracking-[-0.022em] text-[#15181c]">
                    Initial appraisal:{" "}
                    <span className="text-[#b23a2e]">Low — 32 / 100</span>
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.65] text-[#6e675c] max-w-2xl">
                    Generated from HRIS activity exports only. No CRM, ticketing, peer-review or
                    calendar connectors were queried. Confidence is below the contestability threshold.
                  </p>

                  <div className="mt-6 grid sm:grid-cols-2 gap-x-8">
                    {initialSignals.map((s, i) => (
                      <div key={s.id} className="border-t border-[#ded8ce] py-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[13.5px] font-semibold text-[#15181c]">
                            <span className="label text-[9px] text-[#9b9488] mr-2">A{i + 1}</span>
                            {s.label}
                          </span>
                          <span className="text-[11.5px] font-semibold text-[#b23a2e] whitespace-nowrap">{s.value}</span>
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#6e675c]">{s.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 border-l-2 border-[#b23a2e] bg-[#b23a2e]/[0.05] px-5 py-4 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#b23a2e] shrink-0 mt-0.5" />
                    <div className="text-[13px] leading-[1.65] text-[#8e2c22]">
                      <strong className="font-semibold">Contestability flag raised automatically.</strong>{" "}
                      Coverage 31% · confidence 0.41. Policy requires evidence recovery before this
                      label can be acted on by anyone.
                    </div>
                  </div>

                  <button onClick={() => setStep(1)} className={`${btnPrimary} mt-7`}>
                    Run Evidence Engine <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-9"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 label text-[9.5px] text-[#9b9488]">
                        <ScanSearch className="h-3.5 w-3.5 text-[#3c6b4a]" /> Evidence Engine · 14 connectors
                      </div>
                      <h3 className="mt-3 text-[24px] md:text-[30px] font-bold tracking-[-0.022em] text-[#15181c]">
                        Recover what the AI missed
                      </h3>
                    </div>
                    <button
                      onClick={runAutoScan}
                      disabled={scanning || recovered.size === 5}
                      className="inline-flex items-center gap-2 border border-[#1b3a5c] bg-white px-5 py-2.5 text-[12.5px] font-semibold text-[#1b3a5c] hover:bg-[#1b3a5c] hover:text-[#f7f5f1] transition-colors disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#1b3a5c] shrink-0"
                    >
                      {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                      {scanning ? "Scanning…" : recovered.size === 5 ? "Scan complete" : "Auto-scan all"}
                    </button>
                  </div>

                  <div className="mt-6">
                    <div className="grid grid-cols-[36px_1fr_72px] gap-3 label text-[8.5px] text-[#9b9488] pb-2 border-b border-[#15181c]">
                      <span>Rec.</span>
                      <span>Recovered evidence</span>
                      <span className="text-right">Weight</span>
                    </div>
                    {missedEvidence.map((e) => {
                      const on = recovered.has(e.id);
                      return (
                        <div key={e.id} className="border-b border-[#ded8ce]">
                          <div className="grid grid-cols-[36px_1fr_72px] gap-3 items-start py-4">
                            <button
                              onClick={() => toggleRecover(e.id)}
                              aria-label={`Recover ${e.title}`}
                              className={`h-[18px] w-[18px] mt-0.5 border flex items-center justify-center transition-colors ${
                                on ? "bg-[#3c6b4a] border-[#3c6b4a] text-white" : "border-[#15181c]/40 text-transparent hover:border-[#15181c]"
                              }`}
                            >
                              <Check className="h-3 w-3" strokeWidth={4} />
                            </button>
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-[#15181c] leading-snug">
                                {e.title}
                                {!e.verified && (
                                  <span className="ml-2 label text-[8px] text-[#9a6b1c] border border-[#9a6b1c]/40 px-1.5 py-0.5 align-middle">
                                    Partially verified
                                  </span>
                                )}
                              </div>
                              <div className="label text-[8.5px] text-[#9b9488] mt-1.5">
                                {e.category} · {e.source}
                              </div>
                              <AnimatePresence>
                                {on && (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-[12.5px] text-[#4a443b] mt-2 leading-[1.6] overflow-hidden border-l-2 border-[#3c6b4a]/40 pl-3"
                                  >
                                    {e.detail}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                            <div
                              className={`text-right text-[12px] font-semibold whitespace-nowrap ${
                                on ? "text-[#3c6b4a]" : "text-[#9b9488]"
                              }`}
                            >
                              +{e.impact} pts
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="text-[12.5px] text-[#6e675c]">
                      Recovered <strong className="text-[#15181c]">{recovered.size} / 5</strong> · Score{" "}
                      <strong className="text-[#15181c]">
                        {initialScore} → {aiScore}
                      </strong>{" "}
                      · Coverage <strong className="text-[#15181c]">{coverage}%</strong>
                    </div>
                    <div className="flex gap-2.5">
                      <button onClick={() => setStep(0)} className={btnGhost}>
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>
                      <button
                        onClick={() => {
                          if (recovered.size >= 3) {
                            pushAudit({
                              actor: "AI Appraiser",
                              action: `Re-appraisal issued: ${aiScore}/100 · ${aiBand.label.toUpperCase()}`,
                              detail: "Delivery concern retained on record. Confidence 0.83 — above threshold.",
                              kind: "ai",
                            });
                          }
                          setStep(2);
                        }}
                        className={btnPrimary}
                      >
                        Re-run appraisal <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {recovered.size < 3 && (
                    <p className="mt-3 text-[12px] text-[#9a6b1c]">
                      Recover at least 3 items for a defensible re-appraisal — or run the full auto-scan.
                    </p>
                  )}
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-9"
                >
                  <div className="flex items-center gap-2 label text-[9.5px] text-[#9b9488]">
                    <User className="h-3.5 w-3.5 text-[#1b3a5c]" /> Employee side · you are Sarah Lim
                  </div>
                  <h3 className="mt-3 text-[24px] md:text-[30px] font-bold tracking-[-0.022em] text-[#15181c]">
                    Submit your self-appraisal
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.65] text-[#6e675c] max-w-2xl">
                    Sarah sees the AI's score <em>and</em> its reasoning, then gives her own assessment
                    with the context no signal can capture. It becomes part of the permanent record.
                  </p>

                  <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="border-t-2 border-[#1b3a5c] pt-4">
                      <div className="flex items-center gap-1.5 label text-[9px] text-[#1b3a5c]">
                        <Bot className="h-3.5 w-3.5" /> AI's current position
                      </div>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-[42px] leading-none font-bold tracking-[-0.03em] text-[#15181c]">
                          {aiScore}
                        </span>
                        <span className="mb-1.5 text-[12px] font-semibold text-[#1b3a5c] uppercase tracking-[0.12em]">
                          {aiBand.label}
                        </span>
                      </div>
                      <p className="mt-3 text-[12.5px] leading-[1.6] text-[#6e675c]">
                        Based on {4 + recovered.size} signals · {coverage}% coverage. Delivery concern
                        (Mar 14) retained at −6. Employee context invited before manager review.
                      </p>
                    </div>
                    <div className="border-t-2 border-[#15181c] pt-4">
                      <div className="flex items-center gap-1.5 label text-[9px] text-[#15181c]">
                        <User className="h-3.5 w-3.5" /> Your self-assessment
                      </div>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-[42px] leading-none font-bold tracking-[-0.03em] text-[#15181c]">
                          {selfScore}
                        </span>
                        <span className="mb-1.5 text-[12px] font-semibold text-[#6e675c] uppercase tracking-[0.12em]">
                          {selfBand.label}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={95}
                        value={selfScore}
                        onChange={(e) => setSelfScore(Number(e.target.value))}
                        className="mt-4 w-full accent-[#1b3a5c]"
                      />
                      <div className="flex justify-between label text-[8.5px] text-[#9b9488] mt-1">
                        <span>20</span>
                        <span>drag to set your score</span>
                        <span>95</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[#15181c]">
                      <FileText className="h-3.5 w-3.5 text-[#6e675c]" /> Your context — visible to manager and AI
                    </label>
                    <textarea
                      value={selfText}
                      onChange={(e) => setSelfText(e.target.value)}
                      rows={5}
                      className="mt-2 w-full border border-[#ded8ce] bg-white p-4 text-[13px] leading-[1.7] text-[#4a443b] focus:border-[#1b3a5c] focus:outline-none resize-y"
                    />
                    <div className="mt-1.5 flex justify-between label text-[8.5px] text-[#9b9488]">
                      <span>{selfText.length} characters</span>
                      <span className={selfText.length >= 120 ? "text-[#3c6b4a]" : "text-[#9a6b1c]"}>
                        {selfText.length >= 120 ? "Substantive" : "Add more context (≥120 chars)"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2.5">
                    <button onClick={() => setStep(1)} className={btnGhost}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button onClick={submitSelf} disabled={selfText.length < 40} className={btnPrimary}>
                      Submit self-appraisal <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-9"
                >
                  <div className="flex items-center gap-2 label text-[9.5px] text-[#9b9488]">
                    <Users className="h-3.5 w-3.5 text-[#9a6b1c]" /> Manager side · you are {employee.manager}
                  </div>
                  <h3 className="mt-3 text-[24px] md:text-[30px] font-bold tracking-[-0.022em] text-[#15181c]">
                    Agree with the AI — or challenge it
                  </h3>

                  <div className="mt-6 grid grid-cols-3 gap-6">
                    <div className="border-t-2 border-[#1b3a5c] pt-3">
                      <div className="label text-[8.5px] text-[#9b9488]">AI score</div>
                      <div className="text-[30px] leading-none font-bold tracking-[-0.025em] text-[#15181c] mt-1.5">
                        {aiScore}
                      </div>
                      <div className="text-[11.5px] font-semibold text-[#1b3a5c] mt-1 uppercase tracking-[0.1em]">
                        {aiBand.label}
                      </div>
                    </div>
                    <div className="border-t-2 border-[#15181c] pt-3">
                      <div className="label text-[8.5px] text-[#9b9488]">Sarah's self-score</div>
                      <div className="text-[30px] leading-none font-bold tracking-[-0.025em] text-[#15181c] mt-1.5">
                        {selfScore}
                      </div>
                      <div className="text-[11.5px] font-semibold text-[#6e675c] mt-1 uppercase tracking-[0.1em]">
                        {selfBand.label}
                      </div>
                    </div>
                    <div className="border-t-2 border-[#b23a2e] pt-3">
                      <div className="label text-[8.5px] text-[#9b9488]">Divergence</div>
                      <div className="text-[30px] leading-none font-bold tracking-[-0.025em] text-[#b23a2e] mt-1.5">
                        {selfScore > aiScore ? "+" : ""}
                        {selfScore - aiScore}
                      </div>
                      <div className="text-[11.5px] font-semibold text-[#b23a2e] mt-1 uppercase tracking-[0.1em]">
                        {Math.abs(selfScore - aiScore) >= 10 ? "Material — review" : "Aligned"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setManagerStance("agree");
                        pushAudit({
                          actor: "Daniel Ong",
                          action: `Manager agreed with AI: ${aiScore}/100 · ${aiBand.label.toUpperCase()}`,
                          detail: "No challenge filed. Assessment proceeds to resolution.",
                          kind: "manager",
                        });
                        setTimeout(() => setStep(4), 700);
                      }}
                      className={`border p-4 text-left transition-colors ${
                        managerStance === "agree"
                          ? "border-[#3c6b4a] bg-[#3c6b4a]/[0.07]"
                          : "border-[#ded8ce] bg-white hover:border-[#15181c]"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[#15181c]">
                        <CheckCircle2 className="h-4 w-4 text-[#3c6b4a]" /> Agree — proceed
                      </div>
                      <p className="mt-1.5 text-[12px] leading-[1.55] text-[#6e675c]">
                        Accept the AI's reasoning. Assessment finalises as {aiBand.label}.
                      </p>
                    </button>
                    <button
                      onClick={() => setManagerStance("challenge")}
                      className={`border p-4 text-left transition-colors ${
                        managerStance === "challenge"
                          ? "border-[#9a6b1c] bg-[#9a6b1c]/[0.07]"
                          : "border-[#ded8ce] bg-white hover:border-[#15181c]"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[#15181c]">
                        <Gavel className="h-4 w-4 text-[#9a6b1c]" /> Challenge — contest the AI
                      </div>
                      <p className="mt-1.5 text-[12px] leading-[1.55] text-[#6e675c]">
                        Provide reason and evidence. The AI adjudicates. Three attempts maximum.
                      </p>
                    </button>
                  </div>

                  <AnimatePresence>
                    {managerStance === "challenge" && !challengePassed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 border border-[#15181c] bg-[#efece5]">
                          <div className="flex items-center justify-between gap-3 border-b border-[#ded8ce] px-5 py-3.5">
                            <h4 className="text-[13px] font-semibold text-[#15181c]">
                              Structured challenge · Attempt {attempts.length + 1} of 3
                            </h4>
                            <div className="flex gap-1.5">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className={`h-[5px] w-8 ${
                                    i < attempts.length
                                      ? attempts[i].passed
                                        ? "bg-[#3c6b4a]"
                                        : "bg-[#b23a2e]"
                                      : i === attempts.length
                                      ? "bg-[#9a6b1c]"
                                      : "bg-[#15181c]/15"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="bg-white px-5 py-5">
                            <div>
                              <label className="label text-[9px] text-[#9b9488]">Grounds for challenge</label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {[
                                  "Incomplete evidence basis",
                                  "Misweighted signals",
                                  "Missing context on deadline",
                                  "Role-signal mismatch",
                                ].map((r) => (
                                  <button
                                    key={r}
                                    onClick={() => setChallengeReason(r)}
                                    className={`border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                                      challengeReason === r
                                        ? "border-[#1b3a5c] bg-[#1b3a5c] text-[#f7f5f1]"
                                        : "border-[#ded8ce] bg-white text-[#6e675c] hover:border-[#15181c]"
                                    }`}
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="mt-5">
                              <label className="label text-[9px] text-[#9b9488] flex items-center gap-1.5">
                                <Link2 className="h-3 w-3" /> Attach supporting evidence — minimum 2
                              </label>
                              <div className="mt-2 grid sm:grid-cols-2 gap-x-6">
                                {missedEvidence.map((e) => {
                                  const on = challengeEvidence.has(e.id);
                                  return (
                                    <button
                                      key={e.id}
                                      onClick={() => toggleChallengeEv(e.id)}
                                      className={`flex items-center gap-2.5 border-b border-[#ded8ce] py-2.5 text-left text-[12px] transition-colors ${
                                        on ? "text-[#15181c]" : "text-[#9b9488] hover:text-[#4a443b]"
                                      }`}
                                    >
                                      <span
                                        className={`h-[15px] w-[15px] border flex items-center justify-center shrink-0 ${
                                          on ? "bg-[#1b3a5c] border-[#1b3a5c] text-white" : "border-[#15181c]/35"
                                        }`}
                                      >
                                        {on && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
                                      </span>
                                      <span className="truncate">{e.title}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="mt-5">
                              <label className="text-[12px] font-semibold text-[#15181c]">
                                Justification{" "}
                                <span className="text-[#9b9488] font-normal">
                                  — cite evidence, dates and impact, and address the Mar 14 deadline
                                </span>
                              </label>
                              <textarea
                                value={challengeText}
                                onChange={(e) => setChallengeText(e.target.value)}
                                rows={4}
                                placeholder="e.g. The MODERATE assessment underweights verified revenue impact (RM800k, Salesforce Q1 close) and launch ownership across 14 stakeholders. The Mar 14 slip was a vendor asset block flagged 6 days early; Sarah shipped a workaround that preserved the launch date. Her client saves (RM120k ARR) and mentoring load justify HIGH…"
                                className="mt-2 w-full border border-[#ded8ce] bg-white p-3.5 text-[12.5px] leading-[1.7] text-[#4a443b] focus:border-[#1b3a5c] focus:outline-none resize-y placeholder:text-[#b3aa9c]"
                              />
                              <div className="mt-1.5 flex justify-between label text-[8.5px] text-[#9b9488]">
                                <span>
                                  {challengeText.length} chars · {challengeEvidence.size} evidence attached
                                </span>
                                <span className={challengeText.length >= 200 && challengeEvidence.size >= 2 ? "text-[#3c6b4a]" : "text-[#9a6b1c]"}>
                                  {challengeText.length >= 200 && challengeEvidence.size >= 2
                                    ? "Ready for adjudication"
                                    : "Needs ≥200 chars and 2 evidence"}
                                </span>
                              </div>
                            </div>

                            {attempts.length > 0 && (
                              <div className="mt-5 border-t border-[#ded8ce] pt-4 space-y-2.5">
                                {attempts.map((a, i) => (
                                  <div
                                    key={i}
                                    className={`border-l-2 px-4 py-3 text-[12px] leading-[1.6] flex gap-2.5 ${
                                      a.passed
                                        ? "border-[#3c6b4a] bg-[#3c6b4a]/[0.05] text-[#2d5239]"
                                        : "border-[#b23a2e] bg-[#b23a2e]/[0.05] text-[#8e2c22]"
                                    }`}
                                  >
                                    {a.passed ? (
                                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                    ) : (
                                      <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    )}
                                    <span>{a.feedback}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-[#ded8ce] bg-[#efece5] px-5 py-4">
                            {attempts.length >= 3 && !challengePassed ? (
                              <div>
                                <div className="flex items-start gap-3">
                                  <Lock className="h-5 w-5 text-[#1b3a5c] shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-[13.5px] font-semibold text-[#15181c]">
                                      Three attempts exhausted — human override unlocked
                                    </div>
                                    <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[#6e675c] max-w-2xl">
                                      The AI could not be satisfied, so it steps aside. The manager may
                                      now override with signed attestation — and the AI's dissent is
                                      permanently logged. Humans remain the final decision-maker.
                                    </p>
                                    <button
                                      onClick={grantOverride}
                                      className="mt-3.5 inline-flex items-center gap-2 bg-[#15181c] px-5 py-2.5 text-[12.5px] font-semibold text-[#f7f5f1] hover:bg-[#1b3a5c] transition-colors"
                                    >
                                      <ShieldCheck className="h-4 w-4" /> Exercise human override → High
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={evaluateChallenge}
                                disabled={adjudicating || !challengeText.trim()}
                                className={btnPrimary}
                              >
                                {adjudicating ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> AI adjudicating…
                                  </>
                                ) : (
                                  <>
                                    Submit challenge to AI <ArrowRight className="h-4 w-4" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {challengePassed && (
                    <div className="mt-6 border-l-2 border-[#3c6b4a] bg-[#3c6b4a]/[0.05] px-5 py-4 flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#3c6b4a] shrink-0 mt-0.5" />
                      <div className="text-[13px] leading-[1.65] text-[#2d5239]">
                        <strong className="font-semibold">Challenge accepted.</strong> The AI concedes
                        with conditions and proposes a revised assessment. Advancing to resolution…
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <motion.div
                  key="s4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-9"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 label text-[9.5px] text-[#9b9488]">
                      <Gavel className="h-3.5 w-3.5 text-[#1b3a5c]" /> Resolution · sealed record
                    </div>
                    <div className={`stamp text-[9px] ${overrideGranted ? "text-[#1b3a5c]" : "text-[#3c6b4a]"}`}>
                      {overrideGranted ? "Human override" : challengePassed ? "Challenged" : "Settled"}
                    </div>
                  </div>
                  <h3 className="mt-3 text-[24px] md:text-[30px] font-bold tracking-[-0.022em] text-[#15181c]">
                    Exactly what changed — and why
                  </h3>

                  {/* journey */}
                  <div className="mt-7 grid sm:grid-cols-3">
                    {[
                      {
                        k: "Started",
                        v: 32,
                        band: "Low",
                        meta: "4 signals · 31% coverage",
                        tone: "border-[#b23a2e]",
                        num: "text-[#b23a2e]",
                      },
                      {
                        k: "After evidence",
                        v: aiScore,
                        band: aiBand.label,
                        meta: `${4 + recovered.size} signals · ${coverage}% coverage`,
                        tone: "border-[#9a6b1c]",
                        num: "text-[#9a6b1c]",
                      },
                      {
                        k: overrideGranted ? "Final · override" : challengePassed ? "Final · challenged" : "Final · agreed",
                        v: finalScore,
                        band: finalBand.label,
                        meta: overrideGranted ? "Human-signed" : challengePassed ? "AI conceded" : "AI + manager aligned",
                        tone: "border-[#3c6b4a]",
                        num: "text-[#3c6b4a]",
                      },
                    ].map((c, i) => (
                      <motion.div
                        key={c.k}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className={`border-t-2 ${c.tone} pt-3.5 ${i < 2 ? "sm:pr-6" : ""}`}
                      >
                        <div className="label text-[8.5px] text-[#9b9488]">{c.k}</div>
                        <div className={`text-[38px] leading-none font-bold tracking-[-0.03em] mt-1.5 ${c.num}`}>
                          {c.v}
                          <span className="text-[14px] text-[#9b9488] font-medium">/100</span>
                        </div>
                        <div className="text-[11.5px] font-semibold text-[#15181c] mt-1.5 uppercase tracking-[0.11em]">
                          {c.band}
                        </div>
                        <div className="label text-[8.5px] text-[#9b9488] mt-1.5">{c.meta}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* change ledger */}
                  <div className="mt-8 border border-[#ded8ce]">
                    <div className="flex items-center gap-2 border-b border-[#15181c] px-5 py-2.5">
                      <Eye className="h-3.5 w-3.5 text-[#15181c]" />
                      <span className="label text-[9px] text-[#15181c]">Change ledger</span>
                    </div>
                    <table className="w-full">
                      <tbody>
                        {[
                          {
                            mark: "+",
                            tone: "text-[#3c6b4a]",
                            body: (
                              <>
                                <strong className="font-semibold">+{recoveredSum} points</strong> from{" "}
                                {recovered.size} recovered evidence items
                                {recoveredList.length > 0 && (
                                  <span className="text-[#6e675c]">
                                    {" "}
                                    ({recoveredList.map((e) => e.category).join(" · ")})
                                  </span>
                                )}
                              </>
                            ),
                          },
                          {
                            mark: "±",
                            tone: "text-[#1b3a5c]",
                            body: (
                              <>
                                Employee self-appraisal <strong className="font-semibold">{selfScore} ({selfBand.label})</strong>{" "}
                                pinned to the record with full context
                              </>
                            ),
                          },
                          {
                            mark: "≠",
                            tone: "text-[#9a6b1c]",
                            body: (
                              <>
                                {managerStance === "agree" || (!managerStance && attempts.length === 0)
                                  ? "Manager agreed — no contest filed"
                                  : challengePassed
                                  ? `Challenge accepted after ${attempts.length} attempt(s) — adjustment with conditions`
                                  : overrideGranted
                                  ? "Human override after 3 failed attempts — judgment final, AI dissent logged"
                                  : "Manager reviewed — see audit trail"}
                              </>
                            ),
                          },
                          {
                            mark: "=",
                            tone: "text-[#b23a2e]",
                            body: (
                              <>
                                <strong className="font-semibold">Mar 14 delivery concern retained</strong> —
                                visible, contextualised, never erased
                              </>
                            ),
                          },
                        ].map((r, i) => (
                          <tr key={i} className="border-b border-[#ded8ce] last:border-b-0">
                            <td className={`w-10 pl-5 pr-2 py-3.5 align-top text-[13px] font-bold ${r.tone}`}>
                              {r.mark}
                            </td>
                            <td className="pr-5 py-3.5 text-[13px] leading-[1.6] text-[#4a443b]">{r.body}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <button onClick={reset} className={btnGhost}>
                      <RotateCcw className="h-4 w-4" /> Replay case
                    </button>
                    <a href="#audit" className={btnPrimary}>
                      View full audit trail <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SIDE RAIL */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="panel p-5">
              <div className="label text-[9px] text-[#9b9488]">Live assessment</div>
              <div className="mt-2.5 flex items-end justify-between">
                <div className="text-[46px] leading-[0.85] font-bold tracking-[-0.035em] text-[#15181c]">
                  {step >= 4 ? finalScore : step >= 1 ? aiScore : initialScore}
                  <span className="text-[15px] text-[#9b9488] font-medium">/100</span>
                </div>
                <div
                  className={`stamp text-[9px] ${
                    step >= 4
                      ? "text-[#3c6b4a]"
                      : step === 0
                      ? "text-[#b23a2e]"
                      : "text-[#9a6b1c]"
                  }`}
                >
                  {(step >= 4 ? finalBand.label : step === 0 ? "Low" : aiBand.label).toUpperCase()}
                </div>
              </div>
              <div className="mt-4 h-2 bg-[#efece5] border border-[#ded8ce]">
                <div
                  className="h-full bg-[#1b3a5c] transition-[width] duration-700"
                  style={{ width: `${step >= 4 ? finalScore : step >= 1 ? aiScore : initialScore}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-5">
                <div className="border-t border-[#ded8ce] pt-2">
                  <div className="text-[19px] font-bold text-[#15181c] leading-none">{coverage}%</div>
                  <div className="label text-[8.5px] text-[#9b9488] mt-1">Coverage</div>
                </div>
                <div className="border-t border-[#ded8ce] pt-2">
                  <div className="text-[19px] font-bold text-[#15181c] leading-none">{attempts.length} / 3</div>
                  <div className="label text-[8.5px] text-[#9b9488] mt-1">Challenges</div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2.5 border-t border-[#ded8ce] pt-4">
                <img src="/images/sarah.jpg" alt="" className="h-8 w-8 object-cover border border-[#ded8ce] grayscale-[35%]" />
                <div>
                  <div className="text-[12.5px] font-semibold text-[#15181c] leading-tight">{employee.name}</div>
                  <div className="text-[10.5px] text-[#9b9488] mt-0.5">
                    {employee.role} · {employee.tenure}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <div className="flex items-center justify-between">
                <div className="label text-[9px] text-[#9b9488]">Audit feed · live</div>
                <span className="flex items-center gap-1.5 label text-[8px] text-[#3c6b4a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3c6b4a] animate-blink" /> sealed
                </span>
              </div>
              <div className="mt-3.5 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {audit.map((a) => (
                  <div key={a.id} className="flex gap-2.5">
                    <span className={`mt-[5px] h-[6px] w-[6px] shrink-0 ${kindTone[a.kind]}`} />
                    <div className="min-w-0">
                      <div className="text-[11.5px] leading-[1.5] text-[#4a443b]">
                        <span className="font-semibold text-[#15181c]">{a.actor}</span> — {a.action}
                      </div>
                      <div className="label text-[8px] text-[#9b9488] mt-1">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-sunk p-5">
              <div className="flex items-start gap-2.5">
                <ChevronRight className="h-4 w-4 text-[#9b9488] mt-0.5 shrink-0" />
                <div className="text-[11.5px] leading-[1.6] text-[#6e675c]">
                  Try failing the challenge three times to see the human override unlock — the AI
                  cannot be the final decision-maker.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
