import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function POST(req: Request) {
  const { personId } = await req.json();
  if (!personId) return NextResponse.json({ error: "personId required" }, { status: 400 });
  const subs = await prisma.submission.findMany({ where: { personId }, select: { reason: true }, orderBy: { createdAt: "desc" }, take: 80 });
  const notes = subs.map(s => s.reason).join("\n- ");

  const system = `You will receive short free-text notes written by teammates about a person. Write exactly 3 sentences that capture the person's key traits and how others experience working with them. Be specific and uplifting. Do not quote or mention ice-cream flavor names. Avoid generic platitudes.`;
  const user = `Notes:\n- ${notes}`;

  const resp = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.7 })
  });

  if (!resp.ok) {
    const t = await resp.text();
    return NextResponse.json({ error: t }, { status: 500 });
  }
  const data = await resp.json();
  const summary: string = data.choices?.[0]?.message?.content ?? "";

  await prisma.summaryCache.upsert({ where: { personId }, update: { summary }, create: { personId, summary } });
  return NextResponse.json({ ok: true, summary });
}
