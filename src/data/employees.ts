import type { Employee } from "@/lib/types";
import { generatedEmployees } from "./generated";

export const COMPANY = {
  name: "Halcyon Digital Sdn Bhd",
  cycle: "FY2026 H1 Appraisal Cycle",
  cycleWindow: "1 Jan – 30 Jun 2026",
};

export const employees: Employee[] = [
  {
    id: "emp-sarah-lim",
    name: "Sarah Lim",
    title: "Marketing Executive",
    department: "Marketing",
    role: "marketing",
    manager: "Jonathan Lee",
    tenureYears: 3.5,
    location: "Kuala Lumpur",
  },
  {
    id: "emp-daniel-wong",
    name: "Daniel Wong",
    title: "Software Engineer II",
    department: "Engineering",
    role: "engineering",
    manager: "Farah Ismail",
    tenureYears: 2,
    location: "Kuala Lumpur",
  },
  {
    id: "emp-priya-nair",
    name: "Priya Nair",
    title: "Account Manager",
    department: "Sales",
    role: "sales",
    manager: "Kevin Ong",
    tenureYears: 4,
    location: "Penang",
  },
  {
    id: "emp-marcus-tan",
    name: "Marcus Tan",
    title: "Product Manager",
    department: "Product",
    role: "product",
    manager: "Farah Ismail",
    tenureYears: 5,
    location: "Kuala Lumpur",
  },
  {
    id: "emp-aisyah-rahman",
    name: "Aisyah Rahman",
    title: "Operations Lead",
    department: "Operations",
    role: "operations",
    manager: "Kevin Ong",
    tenureYears: 6,
    location: "Johor Bahru",
  },
  {
    id: "emp-jonathan-lee",
    name: "Jonathan Lee",
    title: "Marketing Manager",
    department: "Marketing",
    role: "marketing",
    manager: "Chief Marketing Officer",
    tenureYears: 7,
    location: "Kuala Lumpur",
  },
  ...generatedEmployees,
];

export const DEMO_EMPLOYEE_ID = "emp-sarah-lim";


export function getEmployee(id: string) {
  return employees.find((e) => e.id === id);
}
