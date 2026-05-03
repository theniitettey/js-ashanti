import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/AuthContext";

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
  imageUri?: string;
}

async function fetchProducts(): Promise<Product[]> {
  const data = await apiRequestWithAuth(API_ENDPOINTS.MOBILE.PRODUCTS.LIST);
  return data.products || data || [];
}

async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { imageUri, ...productData } = payload;

  if (imageUri) {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("file", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any);

    Object.entries(productData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return apiRequestWithAuth(API_ENDPOINTS.MOBILE.PRODUCTS.CREATE, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return apiRequestWithAuth(API_ENDPOINTS.MOBILE.PRODUCTS.CREATE, {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

async function deleteProductById(productId: string): Promise<void> {
  return apiRequestWithAuth(
    `${API_ENDPOINTS.MOBILE.PRODUCTS.LIST}/${encodeURIComponent(productId)}`,
    { method: "DELETE" },
  );
}

async function updateProductStock(params: { productId: string; additionalStock: number }): Promise<Product> {
  return apiRequestWithAuth(
    `${API_ENDPOINTS.MOBILE.PRODUCTS.LIST}/${encodeURIComponent(params.productId)}/stock`,
    {
      method: "PATCH",
      body: JSON.stringify({ additionalStock: params.additionalStock }),
    },
  );
}

export function useProducts() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch } = useQuery<Product[]>({
    queryKey: queryKeys.products.all(),
    queryFn: fetchProducts,
    enabled: isAuthenticated,
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

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<void, Error, string>({
    mutationFn: deleteProductById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    },
  });

  return { deleteProduct: mutateAsync, isPending };
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<
    Product,
    Error,
    { productId: string; additionalStock: number }
  >({
    mutationFn: updateProductStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    },
  });

  return { updateStock: mutateAsync, isPending };
}
