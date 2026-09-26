import { motion } from "framer-motion";
import { ScanSearch, Scale, Gavel, ArrowRight } from "lucide-react";

const rows = [
  {
    n: "01",
    icon: ScanSearch,
    title: "Evidence before labels",
    body: "No high-impact label without demonstrated coverage. If the system hasn't seen enough of someone's work, it must say so — and go find the rest before anyone acts on the verdict.",
    tone: "border-[#3c6b4a]",
  },
  {
    n: "02",
    icon: Scale,
    title: "Two-sided contestability",
    body: "Employees submit a self-appraisal with context; managers can challenge the AI with reason and evidence. Disagreement becomes a structured process instead of an email thread nobody resolves.",
    tone: "border-[#1b3a5c]",
  },
  {
    n: "03",
    icon: Gavel,
    title: "Humans stay sovereign",
    body: "Three failed challenge attempts unlock a signed human override. The AI remains accountable to human judgment — it never becomes the final decision-maker.",
    tone: "border-[#b23a2e]",
  },
];

export default function Principles({ onRunDemo }: { onRunDemo: () => void }) {
  return (
    <section id="principles" className="relative py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="grid md:grid-cols-[190px_1fr] gap-6 md:gap-10 border-t-2 border-[#15181c] pt-7">
          <div>
            <div className="label text-[9.5px] text-[#1b3a5c]">04 — Design principles</div>
            <div className="mt-2 text-[11px] text-[#9b9488] leading-[1.5]">
              A trust layer, not another black box
            </div>
          </div>
          <h2 className="text-[30px] md:text-[46px] font-bold tracking-[-0.028em] leading-[1.04] text-[#15181c] max-w-2xl">
            What the system must never do, and what it must always do.
          </h2>
        </div>

        <div className="mt-10">
          {rows.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className={`grid md:grid-cols-[110px_300px_1fr] gap-6 md:gap-10 border-t-2 ${c.tone} pt-6 pb-8`}
            >
              <div>
                <div className="text-[40px] leading-none font-bold tracking-[-0.04em] text-[#ded8ce]">
                  {c.n}
                </div>
                <c.icon className="h-5 w-5 text-[#15181c] mt-3" strokeWidth={1.8} />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.022em] leading-[1.15] text-[#15181c]">
                {c.title}
              </h3>
              <p className="text-[15px] leading-[1.7] text-[#4a443b] max-w-2xl">{c.body}</p>
            </motion.div>
          ))}
        </div>

        {/* case note */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-[1fr_330px] gap-10 items-start"
        >
          <div>
            <div className="label text-[9.5px] text-[#9b9488]">Case note · appended to EMP-0417</div>
            <p className="mt-5 text-[20px] md:text-[27px] leading-[1.38] font-medium tracking-[-0.015em] text-[#15181c] max-w-2xl">
              "The system changed my Low to Moderate — but what mattered most is that it{" "}
              <span className="text-[#1b3a5c] underline decoration-[#1b3a5c]/35 underline-offset-[6px]">
                showed its work
              </span>
              . My manager and I could finally argue with evidence, not vibes."
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-[#ded8ce] pt-4">
              <img
                src="/images/sarah.jpg"
                alt="Sarah Lim"
                className="h-11 w-11 object-cover border border-[#ded8ce] grayscale-[35%]"
              />
              <div>
                <div className="text-[13.5px] font-semibold text-[#15181c]">Sarah Lim</div>
                <div className="text-[11.5px] text-[#9b9488] mt-0.5">
                  Marketing Executive · demo persona, figures illustrative
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="border-b border-[#15181c] px-5 py-2.5">
              <div className="label text-[9px] text-[#15181c]">Outcome summary</div>
            </div>
            <div className="px-5">
              {[
                { k: "Initial verdict", v: "32 · Low", tone: "text-[#b23a2e]" },
                { k: "After evidence", v: "58 · Moderate", tone: "text-[#9a6b1c]" },
                { k: "Final", v: "66 · High*", tone: "text-[#3c6b4a]" },
              ].map((r) => (
                <div key={r.k} className="flex items-center justify-between border-b border-[#ded8ce] py-3">
                  <span className="text-[12px] text-[#6e675c]">{r.k}</span>
                  <span className={`text-[13px] font-semibold ${r.tone}`}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3.5 text-[11.5px] leading-[1.6] text-[#6e675c]">
              *Conditional on a 30-day delivery check-in. The Mar 14 concern remains on record.
            </div>
            <div className="border-t border-[#ded8ce] bg-[#efece5] px-5 py-4">
              <button
                onClick={onRunDemo}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1b3a5c] px-5 py-3 text-[13px] font-semibold text-[#f7f5f1] hover:bg-[#15181c] transition-colors"
              >
                Replay the case <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
