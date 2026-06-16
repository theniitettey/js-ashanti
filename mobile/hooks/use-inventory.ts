import { useQuery } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/AuthContext";

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

/** Derive a stock status from the quantity when the backend doesn't provide one */
function computeStatus(stock: number): InventoryProduct["status"] {
  if (stock === 0) return "OUT";
  if (stock <= 5) return "CRITICAL";
  if (stock <= 15) return "LOW";
  return "HEALTHY";
}

/** Normalise any product-like object coming from the API into our InventoryProduct shape */
function normalizeProduct(raw: any): InventoryProduct {
  const stock = raw.stock ?? raw.stockCount ?? 0;
  return {
    id: raw.id,
    name: raw.name || "Unknown",
    sku: raw.sku || "",
    category: raw.category || "",
    price: typeof raw.price === "number" ? `GH₵${raw.price.toLocaleString()}` : raw.price || "",
    stock,
    status: raw.status && ["CRITICAL", "LOW", "HEALTHY", "OUT"].includes(raw.status)
      ? raw.status
      : computeStatus(stock),
    image: raw.image || "",
    subcategories: raw.subcategories,
    colors: raw.colors,
  };
}

async function fetchInventory(): Promise<InventoryData> {
  try {
    const metricsData = await apiRequestWithAuth(
      API_ENDPOINTS.MOBILE.INVENTORY.METRICS
    );

    // The endpoint now returns { metrics: [], products: [] }
    // but handle the old flat-array shape too for safety
    let products: InventoryProduct[];
    if (Array.isArray(metricsData)) {
      // Old shape: flat array of products
      products = metricsData.map(normalizeProduct);
    } else {
      products = (metricsData.products || []).map(normalizeProduct);
    }

    // Fallback: if we got no products from metrics, fetch from product list
    if (products.length === 0) {
      try {
        const productsData = await apiRequestWithAuth(
          API_ENDPOINTS.MOBILE.PRODUCTS.LIST
        );
        const raw = productsData.products || productsData || [];
        products = (Array.isArray(raw) ? raw : []).map(normalizeProduct);
      } catch {
        // Ignore — metrics data is still valid
      }
    }

    const metrics = Array.isArray(metricsData) ? [] : (metricsData.metrics || []);
    return { metrics, products };
  } catch {
    return { metrics: [], products: [] };
  }
}

export function useInventoryMetrics() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch } = useQuery<InventoryData>({
    queryKey: queryKeys.inventory.all(),
    queryFn: fetchInventory,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
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
