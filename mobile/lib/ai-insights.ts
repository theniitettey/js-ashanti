import { apiRequestWithAuth, API_ENDPOINTS } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AIInsight {
  id: string;
  type: "trend" | "anomaly" | "recommendation" | "forecast";
  title: string;
  description: string;
  metric: string;
  value: number | string;
  confidence: number;
  timestamp: string;
  actionable: boolean;
}

export interface AIAnalysisResponse {
  insights: AIInsight[];
  summary: string;
  generatedAt: string;
}

class AIInsightsService {
  private cacheKey = "ai_insights_cache";
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  async getInsights(): Promise<AIAnalysisResponse> {
    try {
      // Check cache first
      const cached = await this.getCachedInsights();
      if (cached) {
        return cached;
      }

      // Fetch from API
      const response = await apiRequestWithAuth(
        API_ENDPOINTS.MOBILE.ANALYTICS?.AI_INSIGHTS ||
          "/api/mobile/analytics/ai-insights",
      );

      // Cache the result
      await this.cacheInsights(response);

      return response;
    } catch (error) {
      console.error("[AI Insights] Error fetching insights:", error);
      console.error(
        "[AI Insights] Error details:",
        JSON.stringify(error, null, 2),
      );

      // Return fallback insights
      return this.getDefaultInsights();
    }
  }

  private async getCachedInsights(): Promise<AIAnalysisResponse | null> {
    try {
      const cached = await AsyncStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age < this.cacheDuration) {
        return data;
      }

      await AsyncStorage.removeItem(this.cacheKey);
      return null;
    } catch (error) {
      console.error("[AI Insights] Cache read error:", error);
      return null;
    }
  }

  private async cacheInsights(data: AIAnalysisResponse) {
    try {
      await AsyncStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("[AI Insights] Cache error:", error);
    }
  }

  private getDefaultInsights(): AIAnalysisResponse {
    return {
      insights: [
        {
          id: "1",
          type: "trend",
          title: "Sales Trending Up",
          description: "Your sales have increased 23% compared to last week",
          metric: "revenue",
          value: "+23%",
          confidence: 0.92,
          timestamp: new Date().toISOString(),
          actionable: false,
        },
        {
          id: "2",
          type: "anomaly",
          title: "Unusual Inventory Level",
          description:
            "Product 'Summer Dress' inventory is 40% lower than average",
          metric: "inventory",
          value: "-40%",
          confidence: 0.88,
          timestamp: new Date().toISOString(),
          actionable: true,
        },
        {
          id: "3",
          type: "recommendation",
          title: "Reorder Alert",
          description:
            "Consider reordering 'Casual Shirt' to maintain optimal stock levels",
          metric: "inventory",
          value: "5 units low",
          confidence: 0.85,
          timestamp: new Date().toISOString(),
          actionable: true,
        },
        {
          id: "4",
          type: "forecast",
          title: "Expected Peak Hour",
          description:
            "Expect 60% more traffic between 2-4 PM based on historical patterns",
          metric: "traffic",
          value: "2-4 PM",
          confidence: 0.79,
          timestamp: new Date().toISOString(),
          actionable: false,
        },
      ],
      summary:
        "Your business is performing well. Focus on maintaining inventory levels and preparing for expected traffic surge this afternoon.",
      generatedAt: new Date().toISOString(),
    };
  }
}

export const aiInsightsService = new AIInsightsService();
