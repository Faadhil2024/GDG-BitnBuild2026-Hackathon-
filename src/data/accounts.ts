import { employees } from "./employees";

/**
 * Demo accounts. Four people can sign in: three employees (two technical,
 * one non-technical) and one employer. Credentials are deliberately simple —
 * this is a prototype login, not an identity system.
 */
export interface Account {
  name: string;
  officeId: string;
  password: string;
  role: "employee" | "employer";
  /** Employee record this account is bound to (employees only). */
  employeeId?: string;
  title: string;
}

const eng = employees.find((e) => e.role === "engineering")!;
const data = employees.find((e) => e.role === "data")!;

export const ACCOUNTS: Account[] = [
  { name: "Sarah Lim", officeId: "HD-1042", password: "sarah2026", role: "employee", employeeId: "emp-sarah-lim", title: "Marketing Executive" },
  { name: eng.name, officeId: "HD-2210", password: "eng2026", role: "employee", employeeId: eng.id, title: eng.title },
  { name: data.name, officeId: "HD-2377", password: "data2026", role: "employee", employeeId: data.id, title: data.title },
  { name: "Jonathan Lee", officeId: "HD-0007", password: "jonathan2026", role: "employer", title: "Marketing Manager · Reviewer" },
];

/** Employees who must start the demo with no submitted appraisal. */
export const FRESH_EMPLOYEE_IDS = ACCOUNTS.flatMap((a) => (a.employeeId ? [a.employeeId] : []));

export function authenticate(officeId: string, password: string): Account | undefined {
  return ACCOUNTS.find((a) => a.officeId.toLowerCase() === officeId.trim().toLowerCase() && a.password === password);
}
