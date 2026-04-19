import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export interface Product {
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

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  subcategories?: string[];
  colors?: string[];
}

async function fetchProducts(): Promise<Product[]> {
  const data = await apiRequestWithAuth(API_ENDPOINTS.MOBILE.PRODUCTS.LIST);
  return data.products || data || [];
}

async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return apiRequestWithAuth(API_ENDPOINTS.MOBILE.PRODUCTS.CREATE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function useProducts() {
  const { data, isLoading, refetch } = useQuery<Product[]>({
    queryKey: queryKeys.products.all(),
    queryFn: fetchProducts,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: [],
  });

  return {
    products: data ?? [],
    isLoading,
    refetch,
  };
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    Product,
    Error,
    CreateProductPayload
  >({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate both products list and inventory so both screens refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    },
  });

  return {
    createProduct: mutateAsync,
    isPending,
    error,
  };
}
