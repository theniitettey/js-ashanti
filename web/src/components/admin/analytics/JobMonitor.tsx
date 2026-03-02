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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

interface Job {
  job_id: string;
  batch_id: string;
  status: string;
  attempt_count: number;
  created_at: string;
  updated_at: string;
  last_error: string | null;
  error_context: any;
  analysis_time_ms: number | null;
}

interface DeadLetterJob {
  dlq_id: string;
  job_id: string;
  batch_id: string;
  attempt_count: number;
  last_error: string;
  error_context: any;
  failed_at: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getJobStatusBadge(status: string) {
  const variants: Record<string, any> = {
    PENDING: "secondary",
    RUNNING: "default",
    SUCCESS: "outline",
    FAILED: "destructive",
  };
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
}

function ErrorContextViewer({ context }: { context: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!context) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        View Details
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <pre className="max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
          {JSON.stringify(context, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function JobMonitor() {
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [deadLetterJobs, setDeadLetterJobs] = useState<DeadLetterJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchJobs = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
      const [jobsRes, dlqRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/jobs`, { credentials: "include" }),
        fetch(`${backendUrl}/api/admin/dead-letter-queue`, { credentials: "include" }),
      ]);

      if (!jobsRes.ok || !dlqRes.ok) {
        throw new Error("Failed to fetch job data");
      }

      const jobsData = await jobsRes.json();
      const dlqData = await dlqRes.json();

      setActiveJobs(jobsData.jobs || []);
      setDeadLetterJobs(dlqData.jobs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("[JobMonitor] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  const filteredJobs =
    filter === "ALL"
      ? activeJobs
      : activeJobs.filter((job) => job.status === filter);

  return (
    <div className="space-y-4">
      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Analysis Jobs</CardTitle>
          <CardDescription>
            Current and recent job execution status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            {["ALL", "PENDING", "RUNNING", "SUCCESS", "FAILED"].map(
              (status) => (
                <Badge
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilter(status)}
                >
                  {status}
                </Badge>
              )
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Attempts</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.job_id}>
                    <TableCell className="font-mono text-xs">
                      {job.job_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {job.batch_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                    <TableCell className="text-right">
                      {job.attempt_count > 1 ? (
                        <Badge variant="outline">{job.attempt_count}</Badge>
                      ) : (
                        job.attempt_count
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(job.created_at)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(job.updated_at)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatDuration(job.analysis_time_ms)}
                    </TableCell>
                    <TableCell>
                      {job.last_error ? (
                        <div className="max-w-xs">
                          <p className="truncate text-xs text-red-500">
                            {job.last_error}
                          </p>
                          <ErrorContextViewer context={job.error_context} />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dead Letter Queue */}
      {deadLetterJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dead Letter Queue
              <Badge variant="destructive">{deadLetterJobs.length}</Badge>
            </CardTitle>
            <CardDescription>
              Jobs that failed permanently after max retries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DLQ ID</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Attempts</TableHead>
                  <TableHead>Failed At</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadLetterJobs.map((dlq) => (
                  <TableRow key={dlq.dlq_id}>
                    <TableCell className="font-mono text-xs">
                      {dlq.dlq_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {dlq.job_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {dlq.batch_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{dlq.attempt_count}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(dlq.failed_at)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate text-xs text-red-500">
                          {dlq.last_error}
                        </p>
                        <ErrorContextViewer context={dlq.error_context} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
