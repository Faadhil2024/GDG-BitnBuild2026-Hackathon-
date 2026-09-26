"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LevelBadge, Pill } from "@/components/ui";
import type { Confidence, Level } from "@/lib/types";

export interface EmployeeRow {
  id: string;
  name: string;
  title: string;
  department: string;
  level?: Level;
  confidence?: Confidence;
  missing: number;
  count: number;
}

export function EmployeeTable({ rows }: { rows: EmployeeRow[] }) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [level, setLevel] = useState("All");
  const depts = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.department))).sort()], [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (dept === "All" || r.department === dept) &&
        (level === "All" || (level === "Unassessed" ? !r.level : r.level === level)) &&
        (!s || r.name.toLowerCase().includes(s) || r.title.toLowerCase().includes(s) || r.department.toLowerCase().includes(s)),
    );
  }, [rows, q, dept, level]);

  const select = "rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <h2 className="text-base font-semibold">Employees</h2>
        <span className="text-xs text-ink-faint" role="status" aria-live="polite">
          {filtered.length} of {rows.length}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="tbl-q">Filter employees</label>
          <input
            id="tbl-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name, title, department"
            className={`${select} w-64`}
            autoComplete="off"
          />
          <label className="sr-only" htmlFor="tbl-dept">Department</label>
          <select id="tbl-dept" value={dept} onChange={(e) => setDept(e.target.value)} className={select}>
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <label className="sr-only" htmlFor="tbl-level">Assessment</label>
          <select id="tbl-level" value={level} onChange={(e) => setLevel(e.target.value)} className={select}>
            {["All", "Low", "Moderate", "High", "Unassessed"].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <table className="w-full text-sm">
        <caption className="sr-only">Employees in the appraisal cycle with current assessment status</caption>
        <thead className="border-y border-line bg-canvas text-left text-xs text-ink-faint">
          <tr>
            <th scope="col" className="px-6 py-2.5 font-medium">Employee</th>
            <th scope="col" className="px-6 py-2.5 font-medium">Title</th>
            <th scope="col" className="px-6 py-2.5 font-medium">Department</th>
            <th scope="col" className="px-6 py-2.5 font-medium">Assessment</th>
            <th scope="col" className="px-6 py-2.5 font-medium">Evidence</th>
            <th scope="col" className="px-6 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} className="row-link border-t border-line first:border-t-0">
              <th scope="row" className="whitespace-nowrap px-6 py-3.5 text-left font-medium">
                <Link href={`/employees/${r.id}`} className="pressable inline-block text-accent underline-offset-2 hover:underline">
                  {r.name}
                </Link>
              </th>
              <td className="whitespace-nowrap px-6 py-3.5 text-ink-muted">{r.title}</td>
              <td className="whitespace-nowrap px-6 py-3.5 text-ink-muted">{r.department}</td>
              <td className="px-6 py-3.5">{r.level ? <LevelBadge level={r.level} size="sm" /> : <span className="text-ink-faint">Not yet assessed</span>}</td>
              <td className="px-6 py-3.5 tabular-nums text-ink-muted">{r.count ? `${r.count} items` : "—"}</td>
              <td className="whitespace-nowrap px-6 py-3.5">
                {!r.level ? (
                  <Pill tone="neutral">Awaiting evidence</Pill>
                ) : r.missing > 0 || r.confidence === "low" ? (
                  <Pill tone="moderate">Requires review · {r.confidence} confidence</Pill>
                ) : (
                  <Pill tone="high">Assessed · {r.confidence} confidence</Pill>
                )}
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-sm text-ink-faint">
                No employees match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
