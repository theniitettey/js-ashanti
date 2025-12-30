"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { PlayCircle, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Batch {
  batch_id: string;
  status: string;
  event_count: number;
  created_at: string;
  sealed_at: string | null;
  analysis_job?: {
    job_id: string;
    status: string;
    attempt_count: number;
    last_error: string | null;
  };
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusColor(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-blue-500";
    case "SEALED":
      return "bg-yellow-500";
    case "ANALYZED":
      return "bg-green-500";
    case "ARCHIVED":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
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

export function BatchList() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<string | null>(null);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/admin/batches");
      if (!res.ok) {
        throw new Error(`Failed to fetch batches: ${res.statusText}`);
      }
      const data = await res.json();
      setBatches(data.batches || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("[BatchList] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (batchId: string) => {
    setTriggering(batchId);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/analyze`, {
        method: "POST",
      });

      if (res.status === 409) {
        toast("Analysis already in progress for this batch", {
          icon: "ℹ️",
        });
      } else if (res.ok) {
        toast.success("Analysis triggered successfully");
        await fetchBatches(); // Refresh list
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to trigger analysis");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to trigger analysis"
      );
    } finally {
      setTriggering(null);
    }
  };

  useEffect(() => {
    fetchBatches();
    const interval = setInterval(fetchBatches, 15000); // Refresh every 15s
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Event Batches</CardTitle>
            <CardDescription>
              Manage and trigger analysis for event batches
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Events</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Sealed</TableHead>
              <TableHead>Job Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No batches found
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => (
                <TableRow key={batch.batch_id}>
                  <TableCell className="font-mono text-xs">
                    {batch.batch_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getStatusColor(batch.status)}`}
                      />
                      <span className="text-sm">{batch.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {batch.event_count}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(batch.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(batch.sealed_at)}
                  </TableCell>
                  <TableCell>
                    {batch.analysis_job ? (
                      <div className="flex items-center gap-2">
                        {getJobStatusBadge(batch.analysis_job.status)}
                        {batch.analysis_job.attempt_count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            Attempt {batch.analysis_job.attempt_count}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {(batch.status === "OPEN" ||
                      batch.status === "SEALED" ||
                      batch.status === "ANALYZED") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerAnalysis(batch.batch_id)}
                        disabled={triggering === batch.batch_id}
                        title={
                          batch.status === "ANALYZED"
                            ? "Re-analyze this batch"
                            : "Trigger analysis"
                        }
                      >
                        {triggering === batch.batch_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            {batch.status === "ANALYZED"
                              ? "Re-analyze"
                              : "Analyze"}
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
