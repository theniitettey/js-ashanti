"use client";

import { useEffect, useState } from "react";
import { Insight } from "@/interface/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function InsightsTimeline() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
      const res = await fetch(`${backendUrl}/api/insights?limit=20`, {
        credentials: "include",
      });
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : insights.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No insights yet. Events are analyzed every 5 minutes.
            </p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{insight.summary}</p>
                    <Badge className={getConfidenceColor(insight.confidence)}>
                      {Math.round(insight.confidence * 100)}%
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {insight.patterns.map((pattern) => (
                      <Badge key={pattern} variant="outline">
                        {pattern}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{insight.eventCount} events analyzed</span>
                    <span>{new Date(insight.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
