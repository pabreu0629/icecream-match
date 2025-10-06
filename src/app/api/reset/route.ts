import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const formData = await req.formData();
  const confirm = String(formData.get("confirm") || "");
  if (confirm !== "RESET") return NextResponse.redirect(new URL("/admin", req.url));
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Submission" RESTART IDENTITY CASCADE');
  await prisma.summaryCache.deleteMany({});
  return NextResponse.redirect(new URL("/admin", req.url));
}
