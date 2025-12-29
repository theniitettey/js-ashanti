import { NextRequest, NextResponse } from "next/server";
import { getQueueStats } from "@/lib/queue";

/**
 * GET /api/analytics/stats
 * Get queue statistics for monitoring
 */
export async function GET(req: NextRequest) {
  try {
    const stats = await getQueueStats();

    return NextResponse.json({
      queue: stats,
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
