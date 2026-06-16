import { useQuery } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export interface ReportsData {
  [key: string]: any;
}

async function fetchReports(date?: Date): Promise<ReportsData> {
  try {
    const url = date
      ? `${API_ENDPOINTS.MOBILE.ANALYTICS.REPORTS}?date=${date.toISOString()}`
      : API_ENDPOINTS.MOBILE.ANALYTICS.REPORTS;
    return await apiRequestWithAuth(url);
  } catch {
    return {};
  }
}

export function useReports(date?: Date) {
  // Include date in the query key so changing date triggers a refetch
  const { data, isLoading, refetch } = useQuery<ReportsData>({
    queryKey: queryKeys.reports.byDate(date),
    queryFn: () => fetchReports(date),
    staleTime: 60 * 1000, // Fresh for 1 minute
    refetchOnWindowFocus: false,
    placeholderData: {},
  });

  return {
    data: data ?? {},
    isLoading,
    refetch,
  };
}
