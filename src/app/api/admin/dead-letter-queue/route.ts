import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/dead-letter-queue
 * List all dead letter queue entries
 * Admin only
 */
export async function GET(request: Request) {
  try {
    // Auth check
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.deadLetterJob.count();

    // Fetch DLQ entries
    const dlqEntries = await prisma.deadLetterJob.findMany({
      orderBy: { failed_at: "desc" },
      skip,
      take: limit,
    });

    const formattedJobs = dlqEntries.map((entry) => ({
      dlq_id: entry.dlq_id,
      job_id: entry.job_id,
      batch_id: entry.batch_id,
      attempt_count: entry.attempt_count,
      last_error: entry.last_error,
      error_context: entry.error_context,
      failed_at: entry.failed_at.toISOString(),
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/admin/dead-letter-queue] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
