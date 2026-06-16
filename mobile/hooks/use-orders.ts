import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/AuthContext";

export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  customerName: string;
  email: string;
  createdAt: string;
  paymentProvider?: string | null;
  paymentRef?: string | null;
}

export interface OrderStatusSummary {
  PENDING: number;
  PAID: number;
  FULFILLED: number;
  CANCELLED: number;
}

async function fetchOrders(): Promise<AdminOrder[]> {
  const data = await apiRequestWithAuth(API_ENDPOINTS.ORDERS.LIST);
  return Array.isArray(data) ? data : [];
}

export function useOrders() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isFetching, refetch, error } = useQuery<AdminOrder[]>({
    queryKey: queryKeys.orders.all(),
    queryFn: fetchOrders,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 20000 : false,
    refetchOnWindowFocus: true,
    placeholderData: [],
  });

  const orders = data ?? [];

  const summary: OrderStatusSummary = orders.reduce(
    (acc, order) => {
      if (order.status in acc) {
        acc[order.status] += 1;
      }
      return acc;
    },
    { PENDING: 0, PAID: 0, FULFILLED: 0, CANCELLED: 0 } as OrderStatusSummary,
  );

  return {
    orders,
    summary,
    isLoading,
    isFetching,
    refetch,
    error,
  };
}

export function useFulfillOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      apiRequestWithAuth(API_ENDPOINTS.ORDERS.FULFILL(orderId), {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      apiRequestWithAuth(API_ENDPOINTS.ORDERS.CANCEL(orderId), {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });
}
