import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function POST(req: NextRequest) {
  const data = await req.json();

  try {
    const settings = await prisma.businessSettings.create({
        data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to save business settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}