// /app/api/users/update-role/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    // This endpoint is used to fetch all users
    try {
        const user = await prisma.user.findMany();
    
        if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
    
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }}
