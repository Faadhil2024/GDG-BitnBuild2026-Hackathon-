"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { ACCOUNTS, authenticate } from "@/data/accounts";
import { COMPANY } from "@/data/employees";
import { signIn } from "@/lib/session";
import { Button } from "@/components/ui";
import { SkynetMark } from "./brand";

export function Login() {
  const [name, setName] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = authenticate(officeId, password);
    if (!account) {
      setError("Office ID or password did not match. Check the demo accounts below.");
      return;
    }
    signIn(account);
  };

  const field = "mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-[15px] focus:border-accent";

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <section className="hidden flex-col justify-between border-r border-line bg-ink px-14 py-12 text-white lg:flex">
        <SkynetMark size={40} className="text-white [&_rect]:fill-white/10" />
        <div>
          <p className="text-[13px] tracking-[0.18em] text-white/60">{COMPANY.name} · {COMPANY.cycle}</p>
          <h1 className="mt-4 max-w-[18ch] text-[40px] font-semibold leading-[1.1] tracking-tight">
            An appraisal that shows its evidence.
          </h1>
          <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-white/70">
            Every grade is built from indexed records, every record has a source, and every reviewer can see exactly why the number is what it is — and challenge it.
          </p>
        </div>
        <p className="text-xs text-white/50">Prototype. Simulated workplace data only. No real systems are connected.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-3 lg:hidden">
            <SkynetMark size={36} className="text-ink" />
            <span className="text-lg font-semibold tracking-[0.12em]">SKYNET</span>
          </div>
          <h2 className="mt-8 text-[26px] font-semibold tracking-tight lg:mt-0">Sign in</h2>
          <p className="mt-1 text-[15px] text-ink-muted">Use your office ID and password.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="li-name" className="text-sm font-medium">Employee or employer name</label>
              <input id="li-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
            </div>
            <div>
              <label htmlFor="li-id" className="text-sm font-medium">Office ID</label>
              <input id="li-id" value={officeId} onChange={(e) => setOfficeId(e.target.value)} autoComplete="username" placeholder="HD-0000" className={`${field} font-mono`} required />
            </div>
            <div>
              <label htmlFor="li-pw" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input id="li-pw" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={`${field} pr-11`} required />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="pressable absolute right-2 top-1/2 mt-[3px] grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-ink-faint hover:text-ink">
                  {show ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="rounded-md border border-low/30 bg-low-soft px-3 py-2 text-sm">{error}</p>
            )}
            <Button type="submit" variant="primary" className="w-full justify-center py-2.5 text-[15px]">
              Sign in
            </Button>
          </form>

          <details className="mt-8 rounded-md border border-line bg-canvas">
            <summary className="cursor-pointer px-4 py-2.5 text-sm text-ink-muted">Demo accounts</summary>
            <table className="w-full text-[13px]">
              <thead className="text-left text-xs text-ink-faint">
                <tr><th className="px-4 py-1.5 font-medium">Name</th><th className="px-4 py-1.5 font-medium">Office ID</th><th className="px-4 py-1.5 font-medium">Password</th><th className="px-4 py-1.5 font-medium">Role</th></tr>
              </thead>
              <tbody>
                {ACCOUNTS.map((a) => (
                  <tr key={a.officeId} className="border-t border-line">
                    <td className="px-4 py-1.5">
                      <button type="button" className="pressable text-accent hover:underline" onClick={() => { setName(a.name); setOfficeId(a.officeId); setPassword(a.password); setError(""); }}>
                        {a.name}
                      </button>
                    </td>
                    <td className="px-4 py-1.5 font-mono">{a.officeId}</td>
                    <td className="px-4 py-1.5 font-mono">{a.password}</td>
                    <td className="px-4 py-1.5 text-ink-muted">{a.role === "employer" ? "Employer" : a.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      </section>
    </main>
  );
}
