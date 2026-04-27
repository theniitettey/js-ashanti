/**
 * Centralized query key factory.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
 */
export const queryKeys = {
  dashboard: {
    all: () => ["dashboard"] as const,
  },

  reports: {
    all: () => ["reports"] as const,
    byDate: (date?: Date) => ["reports", date?.toDateString() ?? "all"] as const,
  },

  aiInsights: {
    all: () => ["ai-insights"] as const,
  },

  inventory: {
    all: () => ["inventory"] as const,
  },

  products: {
    all: () => ["products"] as const,
    detail: (id: string) => ["products", id] as const,
  },

  orders: {
    all: () => ["orders"] as const,
  },
} as const;
