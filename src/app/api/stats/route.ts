import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await prisma.submission.groupBy({ by: ["personId"], _count: { personId: true } });
  const counts: Record<string, number> = {};
  for (const row of all) counts[row.personId] = row._count.personId;
  return NextResponse.json({ counts });
}
