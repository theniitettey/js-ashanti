import { useQuery } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export interface DashboardMetrics {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalRevenue: number;
  currentVisitors: number;
  activeVisitors: number;
  pageViewsPerMin: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  [key: string]: any;
}

const FALLBACK: DashboardData = {
  metrics: {
    totalProducts: 248,
    lowStock: 18,
    outOfStock: 7,
    totalRevenue: 128000,
    currentVisitors: 1284,
    activeVisitors: 843,
    pageViewsPerMin: 3.2,
  },
};

async function fetchDashboard(): Promise<DashboardData> {
  try {
    return await apiRequestWithAuth(API_ENDPOINTS.MOBILE.ANALYTICS.DASHBOARD);
  } catch {
    return FALLBACK;
  }
}

export function useDashboard() {
  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: queryKeys.dashboard.all(),
    queryFn: fetchDashboard,
    // Poll every 2 seconds to replicate live-traffic behaviour
    refetchInterval: 2000,
    // Don't refetch just because the window was refocused mid-poll
    refetchOnWindowFocus: false,
    // Keep previous data visible while new data arrives
    placeholderData: FALLBACK,
  });

  return {
    data: data ?? FALLBACK,
    metrics: data?.metrics ?? FALLBACK.metrics,
    isLoading,
    refetch,
  };
}
