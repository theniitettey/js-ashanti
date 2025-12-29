"use client";

import { useEffect, useState } from "react";
import { LiveEventFeed } from "@/components/analytics/live-event-feed";
import { InsightsTimeline } from "@/components/analytics/insights-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/analytics/stats");
      const data = await res.json();
      setStats(data.queue);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Queue Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Waiting Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waiting}</div>
              <p className="text-xs text-muted-foreground">In queue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Total processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.failed}
              </div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Feed and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveEventFeed />
        <InsightsTimeline />
      </div>

      {/* Help section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            How to trigger events
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            Events are tracked automatically when users browse products and
            interact with the site.
          </p>
          <p>
            Real-time events appear in the <strong>Live Event Feed</strong>{" "}
            below.
          </p>
          <p>
            AI-generated <strong>Insights</strong> appear every 5 minutes when
            events are analyzed.
          </p>
          <p>
            Check that Redis is running:{" "}
            <code className="bg-white dark:bg-black px-2 py-1 rounded">
              redis-cli ping
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
