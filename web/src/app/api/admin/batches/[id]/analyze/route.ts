import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * POST /api/admin/batches/[id]/analyze
 * Manually trigger analysis for a batch
 *
 * Idempotent: Returns 409 Conflict if analysis already in progress/completed
 * Only allows one job per batch to avoid duplicate processing
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const params = await context.params;
    const batchId = params.id;

    if (!batchId) {
      return NextResponse.json({ error: "Batch ID required" }, { status: 400 });
    }

    // Find batch
    let batch = await prisma.batch.findUnique({
      where: { batch_id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch.status === "OPEN") {
      // Manually seal so we can trigger analysis immediately without waiting for cron
      batch = await prisma.batch.update({
        where: { batch_id: batchId },
        data: {
          status: "SEALED",
          sealed_at: new Date(),
        },
      });
    }

    if (batch.status !== "SEALED" && batch.status !== "ANALYZED") {
      return NextResponse.json(
        {
          error: `Batch must be in SEALED or ANALYZED state to trigger analysis. Current state: ${batch.status}`,
        },
        { status: 400 }
      );
    }

    // Check for existing PENDING or RUNNING job (idempotency)
    const existingJob = await prisma.analysisJob.findFirst({
      where: {
        batch_id: batchId,
        status: {
          in: ["PENDING", "RUNNING"],
        },
      },
    });

    if (existingJob) {
      return NextResponse.json(
        {
          error: "Analysis already in progress for this batch",
          job_id: existingJob.job_id,
          status: existingJob.status,
        },
        { status: 409 } // Conflict
      );
    }

    // Check for SUCCESS job (already analyzed)
    const successJob = await prisma.analysisJob.findFirst({
      where: {
        batch_id: batchId,
        status: "SUCCESS",
      },
      orderBy: { created_at: "desc" },
    });

    if (successJob) {
      // Return 200 OK (idempotent) but indicate it was already done
      return NextResponse.json(
        {
          success: true,
          message: "Batch already analyzed",
          job_id: successJob.job_id,
          analyzed_at: successJob.updated_at.toISOString(),
        },
        { status: 200 }
      );
    }

    // Create new analysis job
    const jobId = nanoid();
    const newJob = await prisma.analysisJob.create({
      data: {
        job_id: jobId,
        batch_id: batchId,
        status: "PENDING",
        trigger_type: "MANUAL", // Mark as manually triggered
        attempt_count: 0,
        max_attempts: 5,
      },
    });

    console.log(
      `[Admin] Manually triggered analysis for batch ${batchId}, job: ${jobId}`
    );

    return NextResponse.json(
      {
        success: true,
        job_id: newJob.job_id,
        batch_id: newJob.batch_id,
        status: newJob.status,
        message: "Analysis job created",
      },
      { status: 202 } // Accepted
    );
  } catch (error) {
    console.error("[Admin] Error triggering analysis:", error);
    return NextResponse.json(
      { error: "Failed to trigger analysis" },
      { status: 500 }
    );
  }
}
