"use client";

import { LiveEventFeed } from "@/components/analytics/live-event-feed";
import { InsightsTimeline } from "@/components/analytics/insights-timeline";
import { MetricsDashboard } from "@/components/admin/analytics/MetricsDashboard";
import { BatchList } from "@/components/admin/analytics/BatchList";
import { JobMonitor } from "@/components/admin/analytics/JobMonitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Production-grade real-time analytics with AI-driven insights
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <MetricsDashboard />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiveEventFeed />
            <InsightsTimeline />
          </div>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches">
          <BatchList />
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <JobMonitor />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <InsightsTimeline />
        </TabsContent>
      </Tabs>

      {/* Help section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Production Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200">
          <div className="space-y-2 text-sm">
            <p>
              <strong>Event Flow:</strong> Events → Batches (100 or 10 min) →
              Analysis Jobs → AI Insights
            </p>
            <p>
              <strong>Resilience:</strong> Circuit breaker protects AI API,
              recovery loop detects stuck jobs, exponential backoff with retries
            </p>
            <p>
              <strong>Self-Healing:</strong> Jobs auto-retry after failures, DLQ
              for permanent failures, automatic crash recovery
            </p>
            <p>
              <strong>Observability:</strong> Real-time metrics refresh every
              10s, manual batch triggers, full job history
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
