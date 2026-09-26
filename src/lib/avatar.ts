import type { Employee } from "./types";

/**
 * Deterministic stock portraits for the synthetic workforce (randomuser.me,
 * free, no key). Sarah keeps the photo used on the landing page. Nothing here
 * is a real Halcyon employee.
 */
const FEMALE = new Set([
  "Nurul", "Kavitha", "Siti", "Mei Yee", "Farah", "Amira", "Devi", "Adeline", "Grace", "Ling", "Shalini", "Nadhirah", "Anusha", "Jasmine", "Chloe",
  "Preethi", "Aina", "Kirthana", "Hui Min", "Balqis", "Sofea", "Meera", "Elaine", "Sarah", "Priya", "Aisyah", "Michelle", "Nadia",
]);

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function avatarUrl(e: Pick<Employee, "id" | "name">): string {
  if (e.id === "emp-sarah-lim") return "/images/sarah.jpg";
  if (e.id === "mgr-jonathan-lee") return "https://randomuser.me/api/portraits/men/32.jpg";
  const first = e.name.split(" ")[0];
  const sex = FEMALE.has(first) ? "women" : "men";
  return `https://randomuser.me/api/portraits/${sex}/${hash(e.id) % 99}.jpg`;
}
