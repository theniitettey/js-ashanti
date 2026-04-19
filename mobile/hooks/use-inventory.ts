import { useQuery } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export interface InventoryMetric {
  id: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
  progressColor: string;
  progress: number;
}

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: "CRITICAL" | "LOW" | "HEALTHY" | "OUT";
  image: string;
  subcategories?: string[];
  colors?: string[];
}

export interface InventoryData {
  metrics: InventoryMetric[];
  products: InventoryProduct[];
}

async function fetchInventory(): Promise<InventoryData> {
  try {
    const metricsData = await apiRequestWithAuth(
      API_ENDPOINTS.MOBILE.INVENTORY.METRICS
    );

    let products: InventoryProduct[] = metricsData.products || [];

    // Fallback: if metrics endpoint doesn't include products, fetch separately
    if (products.length === 0) {
      try {
        const productsData = await apiRequestWithAuth(
          API_ENDPOINTS.MOBILE.PRODUCTS.LIST
        );
        products = productsData.products || productsData || [];
      } catch {
        // Ignore — metrics data is still valid
      }
    }

    return { metrics: metricsData.metrics || [], products };
  } catch {
    return { metrics: [], products: [] };
  }
}

export function useInventoryMetrics() {
  const { data, isLoading, refetch } = useQuery<InventoryData>({
    queryKey: queryKeys.inventory.all(),
    queryFn: fetchInventory,
    staleTime: 30 * 1000, // 30s — inventory changes less often than live traffic
    refetchOnWindowFocus: true,
    placeholderData: { metrics: [], products: [] },
  });

  return {
    metrics: data?.metrics ?? [],
    products: data?.products ?? [],
    isLoading,
    refetch,
  };
}
