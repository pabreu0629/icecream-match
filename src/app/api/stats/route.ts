// src/app/api/stats/route.ts

// --- make this endpoint always dynamic / uncached in production
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Counts = Record<string, number>;

export async function GET() {
  try {
    // Group submissions by personId and count them
    const rows = await prisma.submission.groupBy({
      by: ["personId"],
      _count: { personId: true },
    });

    const counts: Counts = {};
    for (const r of rows) counts[r.personId] = r._count.personId;

    return NextResponse.json(
      { counts },
      {
        // prevent any intermediary/static caching
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
      }
    );
  } catch (err) {
    console.error("[GET /api/stats] error", err);
    return NextResponse.json(
      { counts: {}, error: "stats_failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
