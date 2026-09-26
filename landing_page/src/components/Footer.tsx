import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Footer({ onRunDemo }: { onRunDemo: () => void }) {
  return (
    <footer className="relative bg-[#15181c] text-[#f7f5f1]">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="grid md:grid-cols-[1fr_360px] gap-12 py-14 md:py-16 items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-[#f7f5f1] text-[#15181c]">
                <span className="text-[13px] font-bold tracking-tight">SN</span>
              </div>
              <div className="leading-none">
                <div className="text-[16px] font-bold">SkyNet.</div>
                <div className="label text-[9px] text-[#9b9488] mt-[3px]">Evidence &amp; Contestability</div>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-[17px] md:text-[21px] leading-[1.5] font-medium tracking-[-0.012em] text-[#f7f5f1]">
              Find what's missing. Challenge what's wrong. Show what changed — and why.
            </p>
            <p className="mt-4 max-w-md text-[13.5px] leading-[1.7] text-[#9b9488]">
              A two-sided evidence and contestability layer for AI-assisted appraisal and workforce
              decisions. Evidence proposes. Humans decide.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
              {["PDPA-ready", "SOC2 controls", "Hash-chained audit", "Human override", "Role-aware signals"].map(
                (t) => (
                  <span key={t} className="label text-[9px] text-[#9b9488]">
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="border border-[#f7f5f1]/20 p-6">
            <h3 className="text-[24px] font-bold leading-[1.12] tracking-[-0.022em]">
              Stop acting on
              <br />
              incomplete verdicts.
            </h3>
            <p className="mt-3 text-[13px] leading-[1.65] text-[#9b9488]">
              Run the Sarah Lim case live — from Low on four signals to a fully contested, fully
              audited outcome.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                onClick={onRunDemo}
                className="inline-flex items-center justify-center gap-2 bg-[#f7f5f1] px-6 py-3 text-[13px] font-semibold text-[#15181c] hover:bg-white transition-colors"
              >
                Run live demo <ArrowUpRight className="h-4 w-4" />
              </button>
              <a
                href="#audit"
                className="inline-flex items-center justify-center gap-2 border border-[#f7f5f1]/25 px-6 py-3 text-[13px] font-semibold text-[#f7f5f1] hover:border-[#f7f5f1] transition-colors"
              >
                Audit trail <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 border-t border-[#f7f5f1]/15 py-7 text-[11.5px] text-[#9b9488]">
          <span>© 2026 SkyNet Contestability Systems · Demo environment — all people and figures illustrative</span>
          <span className="label text-[9px]">AI proposes · Evidence disposes · Humans decide</span>
        </div>
      </div>
    </footer>
  );
}
