import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const people = await prisma.person.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return NextResponse.json({ people });
}
