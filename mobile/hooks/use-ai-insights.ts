import { useQuery } from "@tanstack/react-query";
import { aiInsightsService, AIInsight } from "@/lib/ai-insights";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/AuthContext";

export interface AIInsightsData {
  insights: AIInsight[];
}

async function fetchAIInsights(): Promise<AIInsightsData> {
  try {
    const response = await aiInsightsService.getInsights();
    return { insights: response.insights.slice(0, 3) };
  } catch {
    return { insights: [] };
  }
}

export function useAIInsights() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery<AIInsightsData>({
    queryKey: queryKeys.aiInsights.all(),
    queryFn: fetchAIInsights,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    insights: data?.insights ?? [],
    isLoading,
  };
}
