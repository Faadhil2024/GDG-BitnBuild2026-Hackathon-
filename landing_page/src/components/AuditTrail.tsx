import { motion } from "framer-motion";
import { FileCheck2, Fingerprint, ShieldCheck } from "lucide-react";

const rows = [
  { t: "09:41:02", actor: "AI Appraiser", event: "Initial appraisal", detail: "32/100 LOW · 4 signals · cov 31% · conf 0.41", hash: "9f2c…a1" },
  { t: "09:41:03", actor: "Policy Engine", event: "Contestability flag", detail: "Coverage below 60% threshold → evidence recovery required", hash: "b771…04" },
  { t: "09:42:18", actor: "Evidence Engine", event: "Revenue proof recovered", detail: "Salesforce attribution · RM800k influenced · +8", hash: "51de…c9" },
  { t: "09:42:41", actor: "Evidence Engine", event: "Launch ownership recovered", detail: "Asana retros · 2 launches, 14 stakeholders · +6", hash: "aa10…f2" },
  { t: "09:43:05", actor: "Evidence Engine", event: "Client work recovered", detail: "Zendesk + Gong · 47 touchpoints, 2 saves · +5", hash: "77c0…3e" },
  { t: "09:43:29", actor: "Evidence Engine", event: "Mentoring recovered", detail: "Lattice peers · 3 onboarded, 9 kudos · +4", hash: "e0b4…9d" },
  { t: "09:43:52", actor: "Evidence Engine", event: "Collaboration recovered", detail: "Calendar + Docs · 38 workshops · +3", hash: "12f9…6a" },
  { t: "09:44:10", actor: "AI Appraiser", event: "Re-appraisal", detail: "58/100 MODERATE · cov 89% · conf 0.83 · concern retained", hash: "4d21…b7" },
  { t: "09:47:33", actor: "Sarah Lim", event: "Self-appraisal pinned", detail: "74/100 HIGH · vendor-block context on Mar 14", hash: "c8aa…11" },
  { t: "09:52:04", actor: "Daniel Ong", event: "Challenge attempt 1", detail: "Rejected — vague, ungrounded", hash: "90fe…5c" },
  { t: "09:55:47", actor: "Daniel Ong", event: "Challenge attempt 2", detail: "Rejected — concern unaddressed", hash: "3b6d…e8" },
  { t: "10:01:12", actor: "Daniel Ong", event: "Challenge attempt 3", detail: "Accepted — multi-grounded, concern confronted", hash: "f4a2…70" },
  { t: "10:01:13", actor: "AI Appraiser", event: "Revised proposal", detail: "66/100 HIGH (conditional) · 30-day delivery check-in", hash: "6e19…d3" },
  { t: "10:02:00", actor: "System", event: "Record sealed", detail: "14 events · hash-chained · exportable for review", hash: "sealed" },
];

export default function AuditTrail() {
  return (
    <section id="audit" className="relative py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="grid md:grid-cols-[190px_1fr] gap-6 md:gap-10 border-t-2 border-[#15181c] pt-7">
          <div>
            <div className="label text-[9.5px] text-[#1b3a5c]">03 — Auditability</div>
            <div className="mt-2 text-[11px] text-[#9b9488] leading-[1.5]">
              Sealed log · 14 entries · chain verified
            </div>
          </div>
          <h2 className="text-[30px] md:text-[46px] font-bold tracking-[-0.028em] leading-[1.04] text-[#15181c]">
            Every number has a receipt.
          </h2>
        </div>

        <div className="mt-11 grid lg:grid-cols-[340px_1fr] gap-10 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-[15px] leading-[1.7] text-[#4a443b]">
              No black-box scores. Each point movement links to its evidence, its challenger and the
              AI's reasoning — hash-chained so the record can't be quietly rewritten after the fact.
            </p>
            <div className="mt-6">
              {[
                { icon: Fingerprint, t: "Hash-chained log", d: "Tamper-evident, exportable for HR review, appeals and regulators." },
                { icon: ShieldCheck, t: "Dissent is preserved", d: "Rejected challenges and AI objections stay on record — never deleted." },
                { icon: FileCheck2, t: "Human accountability", d: "Overrides require signed attestation: a named human owns the call." },
              ].map((f, i) => (
                <div key={f.t} className="flex gap-4 border-t border-[#ded8ce] py-4">
                  <span className="label text-[9px] text-[#9b9488] pt-1">0{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[#15181c]">
                      <f.icon className="h-4 w-4 text-[#1b3a5c]" /> {f.t}
                    </div>
                    <div className="text-[12.5px] leading-[1.6] text-[#6e675c] mt-1">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="panel"
          >
            <div className="flex items-center justify-between border-b border-[#15181c] px-5 py-3">
              <div className="label text-[9px] text-[#15181c]">
                skynet · case EMP-0417 · sealed log
              </div>
              <span className="inline-flex items-center gap-1.5 label text-[8px] text-[#3c6b4a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3c6b4a] animate-blink" /> chain verified
              </span>
            </div>

            <div className="px-5">
              <div className="hidden sm:grid grid-cols-[62px_128px_1fr_86px] gap-4 label text-[8px] text-[#9b9488] py-2.5 border-b border-[#ded8ce]">
                <span>Time</span>
                <span>Actor</span>
                <span>Event</span>
                <span className="text-right">Hash</span>
              </div>
              {rows.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.025, 0.35) }}
                  className="grid grid-cols-[62px_1fr] sm:grid-cols-[62px_128px_1fr_86px] gap-4 items-start border-b border-[#ded8ce] py-3.5 last:border-b-0 hover:bg-[#efece5]/60 transition-colors"
                >
                  <span className="text-[11px] text-[#9b9488] pt-0.5">{r.t}</span>
                  <span className="hidden sm:block text-[11.5px] text-[#4a443b] pt-0.5">{r.actor}</span>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-[#15181c] leading-tight">
                      {r.event}
                      <span className="sm:hidden text-[11px] font-normal text-[#9b9488]"> · {r.actor}</span>
                    </div>
                    <div className="text-[11.5px] text-[#6e675c] mt-1 leading-[1.5]">{r.detail}</div>
                  </div>
                  <span className="hidden md:block text-right text-[10px] text-[#9b9488] border border-[#ded8ce] bg-[#efece5] px-1.5 py-0.5">
                    {r.hash}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-[#15181c] bg-[#b23a2e]/[0.05] px-5 py-3.5 flex items-center gap-2.5 text-[12px] text-[#8e2c22]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Delivery concern (Mar 14) appears in four entries — retained, contextualised, never erased.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
