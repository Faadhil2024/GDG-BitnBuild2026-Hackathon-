import { useEffect, useState } from "react";
import { Menu, X, Play } from "lucide-react";

export default function Nav({ onRunDemo }: { onRunDemo: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "The Problem", href: "#problem" },
    { label: "Evidence Gap", href: "#gap" },
    { label: "Live Demo", href: "#demo" },
    { label: "Audit Trail", href: "#audit" },
    { label: "Principles", href: "#principles" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#f7f5f1]/95 backdrop-blur border-b border-[#ded8ce]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="flex h-[68px] items-center justify-between">
          <a href="#top" className="text-[26px] font-bold leading-none tracking-[-0.025em] text-[#15181c]">
            SkyNet<span className="text-[#b23a2e]">.</span>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] font-medium text-[#4a443b] hover:text-[#1b3a5c] transition-colors border-b border-transparent hover:border-[#1b3a5c] pb-0.5"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 label text-[9.5px] text-[#9b9488]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3c6b4a] animate-blink" />
              SOC2 · PDPA · Audit-logged
            </div>
            <button
              onClick={onRunDemo}
              className="inline-flex items-center gap-2 bg-[#1b3a5c] px-5 py-2.5 text-[12.5px] font-semibold text-[#f7f5f1] hover:bg-[#15181c] transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Run live demo
            </button>
          </div>

          <button className="lg:hidden p-2 text-[#15181c]" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-[#f7f5f1] border-t border-[#ded8ce] px-6 pb-6 pt-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-[15px] font-medium text-[#15181c] border-b border-[#ded8ce]"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onRunDemo();
            }}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#1b3a5c] px-5 py-3 text-[13px] font-semibold text-[#f7f5f1]"
          >
            <Play className="h-4 w-4" /> Run live demo
          </button>
        </div>
      )}
    </header>
  );
}
