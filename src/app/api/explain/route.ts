import { NextResponse } from "next/server";
import { explainChange } from "@/lib/ai/service";
import { ExplainInputSchema, type ExplainInput } from "@/lib/ai/schema";
import { getEvidence } from "@/data/evidence";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = ExplainInputSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // The server re-derives evidence from the fixture dataset; the client cannot inject facts.
  const input = body.data as ExplainInput;
  input.evidence = input.evidence
    .map((e) => getEvidence(e.id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map(({ id, summary, category, direction, impact, confidence, mitigates }) => ({ id, summary, category, direction, impact, confidence, mitigates }));

  return NextResponse.json(await explainChange(input));
}
