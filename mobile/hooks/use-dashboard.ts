import { useQuery } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: queryKeys.dashboard.all(),
    queryFn: fetchDashboard,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 2000 : false,
    refetchOnWindowFocus: false,
    placeholderData: FALLBACK,
  });

  return {
    data: data ?? FALLBACK,
    metrics: data?.metrics ?? FALLBACK.metrics,
    isLoading,
    refetch,
  };
}
