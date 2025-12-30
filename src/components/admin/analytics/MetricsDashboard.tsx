"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface MetricsData {
  jobs: {
    pending: number;
    running: number;
    success_last_hour: number;
    failed_last_hour: number;
    oldest_pending_age_seconds: number | null;
  };
  batches: {
    open: number;
    sealed: number;
    analyzed: number;
    oldest_open_age_seconds: number | null;
  };
  performance: {
    avg_analysis_time_ms: number | null;
    p95_analysis_time_ms: number | null;
    avg_batch_size: number | null;
  };
  circuit_breaker: {
    state: "CLOSED" | "OPEN" | "HALF_OPEN";
    failure_count: number;
    last_state_change: string | null;
  };
  dead_letter_queue: {
    total: number;
    last_24_hours: number;
  };
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "N/A";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

function formatMs(ms: number | null): string {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) {
        throw new Error(`Failed to fetch metrics: ${res.statusText}`);
      }
      const data = await res.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("[MetricsDashboard] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return null;
  }

  const circuitBreakerColor =
    metrics.circuit_breaker.state === "CLOSED"
      ? "bg-green-500"
      : metrics.circuit_breaker.state === "OPEN"
        ? "bg-red-500"
        : "bg-yellow-500";

  const hasDLQIssues = metrics.dead_letter_queue.total > 0;

  return (
    <div className="space-y-4">
      {/* Circuit Breaker Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${circuitBreakerColor}`} />
          <span className="text-sm font-medium">
            Circuit Breaker: {metrics.circuit_breaker.state}
          </span>
          {metrics.circuit_breaker.state !== "CLOSED" && (
            <Badge variant="outline" className="ml-2">
              {metrics.circuit_breaker.failure_count} failures
            </Badge>
          )}
        </div>
        {hasDLQIssues && (
          <Badge variant="destructive">
            {metrics.dead_letter_queue.total} jobs in DLQ
          </Badge>
        )}
      </div>

      {/* DLQ Alert */}
      {hasDLQIssues && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {metrics.dead_letter_queue.total} jobs have failed permanently and
            moved to Dead Letter Queue.
            {metrics.dead_letter_queue.last_24_hours > 0 &&
              ` ${metrics.dead_letter_queue.last_24_hours} in the last 24 hours.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Job Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Analysis Jobs</CardTitle>
            <CardDescription>Current queue status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-bold">{metrics.jobs.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Running</span>
              </div>
              <span className="font-bold">{metrics.jobs.running}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Success (1h)</span>
              </div>
              <span className="font-bold">
                {metrics.jobs.success_last_hour}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Failed (1h)</span>
              </div>
              <span className="font-bold">{metrics.jobs.failed_last_hour}</span>
            </div>
            {metrics.jobs.oldest_pending_age_seconds !== null && (
              <div className="mt-2 border-t pt-2">
                <div className="text-xs text-muted-foreground">
                  Oldest pending:{" "}
                  {formatDuration(metrics.jobs.oldest_pending_age_seconds)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Event Batches</CardTitle>
            <CardDescription>Batch processing status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Open</span>
              <Badge variant="outline">{metrics.batches.open}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sealed</span>
              <Badge variant="secondary">{metrics.batches.sealed}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Analyzed</span>
              <Badge variant="default">{metrics.batches.analyzed}</Badge>
            </div>
            {metrics.batches.oldest_open_age_seconds !== null && (
              <div className="mt-2 border-t pt-2">
                <div className="text-xs text-muted-foreground">
                  Oldest open:{" "}
                  {formatDuration(metrics.batches.oldest_open_age_seconds)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <CardDescription>Analysis timing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Time</span>
              <span className="font-mono text-sm">
                {formatMs(metrics.performance.avg_analysis_time_ms)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">P95 Time</span>
              <span className="font-mono text-sm">
                {formatMs(metrics.performance.p95_analysis_time_ms)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Batch Size</span>
              <span className="font-mono text-sm">
                {metrics.performance.avg_batch_size?.toFixed(1) || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
