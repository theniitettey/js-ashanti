import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/jobs
 * List all analysis jobs with their status
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
    const total = await prisma.analysisJob.count();

    // Fetch recent jobs
    const jobs = await prisma.analysisJob.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    });

    const formattedJobs = jobs.map((job) => ({
      job_id: job.job_id,
      batch_id: job.batch_id,
      status: job.status,
      attempt_count: job.attempt_count,
      created_at: job.created_at.toISOString(),
      updated_at: job.updated_at.toISOString(),
      last_error: job.last_error,
      error_context: job.error_context,
      analysis_time_ms: job.analysis_time_ms,
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/admin/jobs] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
