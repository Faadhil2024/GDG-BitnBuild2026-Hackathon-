import Nav from "./components/Nav";
import Hero from "./components/Hero";
import EvidenceGap from "./components/EvidenceGap";
import DemoConsole from "./components/DemoConsole";
import AuditTrail from "./components/AuditTrail";
import Principles from "./components/Principles";
import Footer from "./components/Footer";

function Marquee() {
  const items = [
    "RM800K INFLUENCED REVENUE MISSED",
    "2 CROSS-FUNCTIONAL LAUNCHES INVISIBLE",
    "47 CLIENT TOUCHPOINTS IGNORED",
    "3 HIRES MENTORED, UNCOUNTED",
    "38 WORKSHOPS UNSEEN",
    "1 DEADLINE OVERWEIGHTED",
  ];
  const row = [...items, ...items];
  return (
    <div className="relative border-y border-[#ded8ce] bg-[#efece5] py-3 overflow-hidden">
      <div className="flex w-max animate-marquee gap-0">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-5 pr-5 label text-[9px] text-[#6e675c] whitespace-nowrap"
          >
            <span className={i % 2 === 0 ? "text-[#3c6b4a]" : "text-[#b23a2e]"}>●</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

const Rule = () => (
  <div className="mx-auto max-w-[1240px] px-6 md:px-10">
    <div className="h-px bg-[#ded8ce]" />
  </div>
);

export default function App() {
  const runDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-[#15181c]">
      <Nav onRunDemo={runDemo} />
      <main>
        <Hero onRunDemo={runDemo} />
        <Marquee />
        <EvidenceGap />
        <Rule />
        <DemoConsole />
        <Rule />
        <AuditTrail />
        <Rule />
        <Principles onRunDemo={runDemo} />
      </main>
      <Footer onRunDemo={runDemo} />
    </div>
  );
}
