import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/analytics/stats
 * Get batch and job statistics for monitoring
 */
export async function GET(req: NextRequest) {
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

  try {
    const [
      openBatches,
      sealedBatches,
      analyzedBatches,
      pendingJobs,
      runningJobs,
    ] = await Promise.all([
      prisma.batch.count({ where: { status: "OPEN" } }),
      prisma.batch.count({ where: { status: "SEALED" } }),
      prisma.batch.count({ where: { status: "ANALYZED" } }),
      prisma.analysisJob.count({ where: { status: "PENDING" } }),
      prisma.analysisJob.count({ where: { status: "RUNNING" } }),
    ]);

    return NextResponse.json({
      batches: {
        open: openBatches,
        sealed: sealedBatches,
        analyzed: analyzedBatches,
      },
      jobs: { pending: pendingJobs, running: runningJobs },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching analytics stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
