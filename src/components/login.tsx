"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeSlash, Check, Warning, ArrowRight } from "@phosphor-icons/react";
import { ACCOUNTS, authenticate } from "@/data/accounts";
import { COMPANY } from "@/data/employees";
import { signIn } from "@/lib/session";
import { Button } from "@/components/ui";
import { SkynetMark } from "./brand";

/* The grade moves as evidence arrives — the product's thesis, shown on the door. */
const BEFORE = [
  { l: "GitHub commits: 3", neg: true },
  { l: "Slack volume: low", neg: true },
  { l: "Missed deadline (Mar 14)", neg: true },
];
const AFTER = [
  { l: "Influenced campaign revenue · EV-102", neg: false },
  { l: "Cross-functional launches · EV-104", neg: false },
  { l: "Client saves and touchpoints · EV-107", neg: false },
  { l: "Missed deadline (Mar 14), retained", neg: true },
];

export function Login() {
  const [name, setName] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [full, setFull] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setFull((v) => !v), 4500);
    return () => clearInterval(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = authenticate(officeId, password);
    if (!account) return setError("Office ID or password did not match. Use a demo account below.");
    signIn(account);
  };

  const field = "mt-1.5 w-full rounded-md border border-line bg-surface px-3.5 py-3 text-[16px] focus:border-accent";

  return (
    <main className="landing grid min-h-[100dvh] lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
      {/* Left: the thesis, with a live proof filling the panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#15181c] px-14 py-10 text-[#f7f5f1] lg:flex" aria-label="About SKYNET">
        <div className="signin-grid absolute inset-0" aria-hidden="true" />
        <div className="relative flex items-center justify-between">
          <Link href="/" className="pressable inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-white">
            <ArrowLeft size={14} weight="bold" /> Back to overview
          </Link>
          <SkynetMark size={36} className="text-white [&_rect]:fill-white/10" />
        </div>

        <div className="relative grid gap-12 xl:grid-cols-[1fr_360px] xl:items-center">
          <div>
            <p className="label text-[11px] text-white/50">{COMPANY.name} · {COMPANY.cycle}</p>
            <h1 className="mt-5 max-w-[15ch] text-[52px] font-bold leading-[1.02] tracking-[-0.03em] xl:text-[60px]">
              An appraisal that shows its <span className="text-[#8fb3dc]">evidence.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-white/70">
              Every grade is built from indexed records. Every record has a source. Every reviewer can see why the grade is what it is — and contest it with proof.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
              {[
                { k: "100", v: "employees, 11 role families" },
                { k: "6", v: "protocols every grade is checked against" },
                { k: "3", v: "review rounds before a human override" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[34px] font-bold leading-none tracking-tight tabular-nums">{s.k}</dt>
                  <dd className="mt-2 text-[13px] leading-snug text-white/60">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Live card */}
          <div className="relative" aria-hidden="true">
            <div className="absolute inset-0 translate-x-3 translate-y-3 border border-white/10 bg-white/[0.04]" />
            <div className="relative border border-white/15 bg-[#1c2026] p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[15px] font-semibold">Sarah Lim</p>
                  <p className="text-[12px] text-white/50">Marketing Executive</p>
                </div>
                <span key={String(full)} className={`stamp stamp-in text-[14px] ${full ? "text-[#7ccf97]" : "text-[#f08a7e]"}`}>{full ? "B" : "C"}</span>
              </div>
              <p className="label mt-4 text-[9px] text-white/40">{full ? "Whole picture · 9 signals" : "Partial view · 4 signals"}</p>
              <ul className="mt-2 space-y-2">
                {(full ? AFTER : BEFORE).map((s) => (
                  <li key={s.l} className="flex items-center gap-2 text-[13px] text-white/80">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.neg ? "bg-[#f08a7e]" : "bg-[#7ccf97]"}`} />
                    {s.l}
                  </li>
                ))}
              </ul>
              <div className={`mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-[12px] leading-snug ${full ? "text-[#a9dfbb]" : "text-[#f5b3aa]"}`}>
                {full ? <Check size={14} weight="bold" className="mt-0.5 shrink-0" /> : <Warning size={14} className="mt-0.5 shrink-0" />}
                {full ? "Missing proofs recovered. The concern stays on record." : "Incomplete basis. Grade not yet justified."}
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-[12px] text-white/40">Prototype. Simulated workplace data only. No real systems are connected.</p>
      </section>

      {/* Right: the form */}
      <section className="flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-ink-muted"><ArrowLeft size={14} weight="bold" /> Overview</Link>
            <SkynetMark size={32} className="text-ink" />
          </div>
          <p className="label mt-8 text-[11px] text-ink-faint lg:mt-0">Sign in</p>
          <h2 className="mt-2 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Welcome back.</h2>
          <p className="mt-2 text-[16px] text-ink-muted">Use your office ID and password.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="li-name" className="text-[14px] font-medium">Employee or employer name</label>
              <input id="li-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
            </div>
            <div>
              <label htmlFor="li-id" className="text-[14px] font-medium">Office ID</label>
              <input id="li-id" value={officeId} onChange={(e) => setOfficeId(e.target.value)} autoComplete="username" placeholder="HD-0000" className={`${field} font-mono`} required />
            </div>
            <div>
              <label htmlFor="li-pw" className="text-[14px] font-medium">Password</label>
              <div className="relative">
                <input id="li-pw" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={`${field} pr-12`} required />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="pressable absolute right-2 top-1/2 mt-[3px] grid h-9 w-9 -translate-y-1/2 place-items-center rounded text-ink-faint hover:text-ink">
                  {show ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p role="alert" className="rounded-md border border-low/30 bg-low-soft px-3 py-2 text-[14px]">{error}</p>}
            <Button type="submit" variant="primary" className="group w-full justify-center py-3 text-[16px]">
              Sign in <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>

          <div className="mt-8">
            <p className="label text-[10px] text-ink-faint">Demo accounts · click to fill</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {ACCOUNTS.map((a) => (
                <li key={a.officeId}>
                  <button
                    type="button"
                    onClick={() => { setName(a.name); setOfficeId(a.officeId); setPassword(a.password); setError(""); }}
                    className="pressable w-full rounded-md border border-line bg-surface px-3.5 py-3 text-left hover:border-accent"
                  >
                    <span className="block text-[14px] font-semibold">{a.name}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-muted">{a.role === "employer" ? "Employer · reviews all 100" : a.title}</span>
                    <span className="mt-1.5 block font-mono text-[11px] text-ink-faint">{a.officeId} · {a.password}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
