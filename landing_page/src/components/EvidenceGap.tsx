import { motion } from "framer-motion";
import {
  GitCommitHorizontal,
  MessageSquare,
  Activity,
  CalendarX2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { initialSignals, missedEvidence } from "../data/case";

const signalIcons: Record<string, any> = {
  "sig-activity": Activity,
  "sig-github": GitCommitHorizontal,
  "sig-slack": MessageSquare,
  "sig-deadline": CalendarX2,
};

export default function EvidenceGap() {
  return (
    <section id="gap" className="relative py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="grid md:grid-cols-[190px_1fr] gap-6 md:gap-10 border-t-2 border-[#15181c] pt-7">
          <div>
            <div className="label text-[9.5px] text-[#1b3a5c]">01 — The evidence gap</div>
            <div className="mt-2 text-[11px] text-[#9b9488] leading-[1.5]">
              Case EMP-0417 · Sarah Lim · Marketing Executive
            </div>
          </div>
          <div>
            <h2 className="text-[30px] md:text-[46px] font-bold tracking-[-0.028em] leading-[1.04] text-[#15181c]">
              The problem isn't the <span className="text-[#b23a2e]">Low</span> label.
              <br />
              It's that the system hadn't earned it.
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[17px] leading-[1.65] text-[#4a443b] max-w-2xl">
              Sarah's initial appraisal saw four narrow signals — and none of the work that actually
              mattered. The evidence engine scans the full work surface to prove whether a label is
              justified before anyone acts on it.
            </p>
          </div>
        </div>

        <div className="mt-11 grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: what AI saw */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="panel"
          >
            <div className="flex items-start justify-between border-b-2 border-[#b23a2e] px-6 py-5">
              <div>
                <div className="label text-[9.5px] text-[#b23a2e]">Column A — What the initial AI saw</div>
                <div className="text-[19px] font-semibold tracking-[-0.015em] text-[#15181c] mt-1.5">
                  4 signals · 31% coverage
                </div>
              </div>
              <div className="stamp text-[15px] px-3.5 py-1.5 text-[#b23a2e]">Low</div>
            </div>

            <div className="px-6 py-2">
              {initialSignals.map((s, i) => {
                const Icon = signalIcons[s.id];
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-4 border-b border-[#ded8ce] py-4 last:border-b-0"
                  >
                    <div className="w-9 shrink-0 pt-0.5">
                      <span className="label text-[9px] text-[#9b9488]">A{i + 1}</span>
                    </div>
                    <Icon className="h-[18px] w-[18px] shrink-0 mt-0.5 text-[#b23a2e]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="text-[14px] font-semibold text-[#15181c]">{s.label}</div>
                        <div className="text-[11.5px] font-semibold text-[#b23a2e] whitespace-nowrap">{s.value}</div>
                      </div>
                      <div className="text-[12.5px] text-[#6e675c] mt-1 leading-[1.55]">{s.note}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="border-t border-[#ded8ce] bg-[#b23a2e]/[0.05] px-6 py-4">
              <div className="text-[12.5px] leading-[1.6] text-[#8e2c22]">
                <strong className="font-semibold">Verdict basis insufficient.</strong> No revenue,
                ownership, client, mentoring or collaboration data consulted. Confidence{" "}
                <span className="font-semibold">0.41</span> — below the contestability threshold.
              </div>
            </div>
          </motion.div>

          {/* RIGHT: what system reveals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1 }}
            className="panel"
          >
            <div className="flex items-start justify-between border-b-2 border-[#3c6b4a] px-6 py-5">
              <div>
                <div className="label text-[9.5px] text-[#3c6b4a]">Column B — What SkyNet recovered</div>
                <div className="text-[19px] font-semibold tracking-[-0.015em] text-[#15181c] mt-1.5">
                  5 proofs · 89% coverage
                </div>
              </div>
              <div className="stamp text-[15px] px-3.5 py-1.5 text-[#3c6b4a]">Moderate</div>
            </div>

            <div className="px-6 py-2">
              {missedEvidence.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-4 border-b border-[#ded8ce] py-4 last:border-b-0 group"
                >
                  <div className="w-9 shrink-0 pt-0.5">
                    <span className="label text-[9px] text-[#9b9488]">B{i + 1}</span>
                  </div>
                  <CheckCircle2 className="h-[18px] w-[18px] shrink-0 mt-0.5 text-[#3c6b4a]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-[14px] font-semibold text-[#15181c] leading-snug">{e.title}</div>
                      <div className="text-[11.5px] font-semibold text-[#3c6b4a] whitespace-nowrap">+{e.impact} pts</div>
                    </div>
                    <div className="label text-[8.5px] text-[#9b9488] mt-1.5">
                      {e.category} · {e.source}
                    </div>
                    <div className="text-[12.5px] text-[#6e675c] mt-1.5 leading-[1.55]">{e.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-[#ded8ce] bg-[#3c6b4a]/[0.05] px-6 py-4 flex gap-2.5">
              <Lock className="h-4 w-4 shrink-0 mt-0.5 text-[#3c6b4a]" />
              <div className="text-[12.5px] leading-[1.6] text-[#2d5239]">
                <strong className="font-semibold">Delivery concern retained.</strong> The missed
                deadline stays on record with full context — recovery adds truth, it doesn't erase it.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
