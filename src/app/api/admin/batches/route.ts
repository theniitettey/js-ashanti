import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/batches
 * List all batches with their analysis job status
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
    const total = await prisma.batch.count({
      where: {
        status: {
          in: ["OPEN", "SEALED", "ANALYZED"],
        },
      },
    });

    // Fetch batches with their jobs
    const batches = await prisma.batch.findMany({
      where: {
        status: {
          in: ["OPEN", "SEALED", "ANALYZED"],
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    });

    // Get analysis jobs for these batches
    const batchIds = batches.map((b) => b.batch_id);
    const jobs = await prisma.analysisJob.findMany({
      where: {
        batch_id: { in: batchIds },
        status: { in: ["PENDING", "RUNNING"] },
      },
      orderBy: { created_at: "desc" },
    });

    // Create a map of batch_id to job
    const jobsByBatchId = new Map(jobs.map((job) => [job.batch_id, job]));

    // Format response
    const formattedBatches = batches.map((batch) => {
      const job = jobsByBatchId.get(batch.batch_id);
      return {
        batch_id: batch.batch_id,
        status: batch.status,
        event_count: batch.event_count,
        created_at: batch.created_at.toISOString(),
        sealed_at: batch.sealed_at?.toISOString() || null,
        analysis_job: job
          ? {
              job_id: job.job_id,
              status: job.status,
              attempt_count: job.attempt_count,
              last_error: job.last_error,
            }
          : undefined,
      };
    });

    return NextResponse.json({
      batches: formattedBatches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/admin/batches] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
