import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Typography from "@/constants/typography";
import { useState, useEffect } from "react";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";
import { useRouter } from "expo-router";

// Types
interface StockMetric {
  id: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
  progressColor: string;
  progress: number;
}

interface Product {
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

type StatusColors = {
  [key in Product["status"]]: {
    badge: string;
    text: string;
    stock: string;
    dot: string;
  };
};

// Stock Summary Metrics
const STOCK_METRICS: StockMetric[] = [
  {
    id: "1",
    icon: "shippingbox.fill",
    iconColor: "#A855F7",
    iconBgColor: "#2D1B4E",
    label: "Total Products",
    value: "248",
    progressColor: "#3B82F6",
    progress: 0.75,
  },
  {
    id: "2",
    icon: "exclamationmark.triangle.fill",
    iconColor: "#F59E0B",
    iconBgColor: "#4A3610",
    label: "Low Stock",
    value: "18",
    progressColor: "#F97316",
    progress: 0.35,
  },
  {
    id: "3",
    icon: "circle.fill",
    iconColor: "#EF4444",
    iconBgColor: "#4A1D1D",
    label: "Out of Stock",
    value: "7",
    progressColor: "#EF4444",
    progress: 0.15,
  },
  {
    id: "4",
    icon: "dollarsign.circle.fill",
    iconColor: "#10B981",
    iconBgColor: "#1A3D2F",
    label: "Total Value",
    value: "$128k",
    progressColor: "#10B981",
    progress: 0.85,
  },
];

// Categories
const CATEGORIES = [
  { id: "all", label: "All Products", active: true },
  { id: "electronics", label: "Electronics", active: false },
  { id: "clothing", label: "Clothing", active: false },
  { id: "home", label: "Home & Living", active: false },
  { id: "accessories", label: "Accessories", active: false },
];

// Products
const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Gaming Mouse Pro X",
    sku: "GM-9021",
    category: "Electronics",
    price: "$79.99",
    stock: 3,
    status: "CRITICAL",
    image: "",
    subcategories: ["Peripherals", "Gaming"],
    colors: ["Black", "RGB"],
  },
  {
    id: "2",
    name: "Mechanical Keyboard RGB",
    sku: "KB-7843",
    category: "Electronics",
    price: "$149.99",
    stock: 12,
    status: "LOW",
    image: "",
    subcategories: ["Peripherals", "Gaming"],
    colors: ["Black", "White"],
  },
  {
    id: "3",
    name: '4K Ultra HD Monitor 32"',
    sku: "MN-5621",
    category: "Electronics",
    price: "$599.99",
    stock: 45,
    status: "HEALTHY",
    image: "",
    subcategories: ["Displays"],
    colors: ["Black"],
  },
  {
    id: "4",
    name: "Wireless Earbuds Pro",
    sku: "EB-3901",
    category: "Electronics",
    price: "$89.99",
    stock: 0,
    status: "OUT",
    image: "",
    subcategories: ["Audio"],
    colors: ["White", "Black"],
  },
  {
    id: "5",
    name: "Smart Watch Series 7",
    sku: "SW-2847",
    category: "Electronics",
    price: "$299.99",
    stock: 38,
    status: "HEALTHY",
    image: "",
    subcategories: ["Wearables"],
    colors: ["Black", "Silver", "Gold"],
  },
  {
    id: "6",
    name: "Premium Laptop Bag",
    sku: "LB-4092",
    category: "Accessories",
    price: "$49.99",
    stock: 8,
    status: "LOW",
    image: "",
    subcategories: ["Bags"],
    colors: ["Grey", "Black"],
  },
];

const STATUS_COLORS: StatusColors = {
  CRITICAL: {
    badge: "#4A1D1D",
    text: "#EF4444",
    stock: "#EF4444",
    dot: "#EF4444",
  },
  LOW: {
    badge: "#4A3610",
    text: "#F59E0B",
    stock: "#F97316",
    dot: "#F59E0B",
  },
  HEALTHY: {
    badge: "#1A3D2F",
    text: "#10B981",
    stock: "#10B981",
    dot: "#10B981",
  },
  OUT: {
    badge: "#4A1D1D",
    text: "#EF4444",
    stock: "#EF4444",
    dot: "#EF4444",
  },
};

// Components
const StockMetricCard = ({ metric }: { metric: StockMetric }) => {
  return (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIconContainer,
          { backgroundColor: metric.iconBgColor },
        ]}
      >
        <IconSymbol
          name={metric.icon as any}
          size={24}
          color={metric.iconColor}
        />
      </View>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: metric.progressColor,
              width: `${metric.progress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const statusColor = STATUS_COLORS[product.status];

  return (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <View style={styles.productImagePlaceholder}>
          <IconSymbol name="photo" size={40} color="#4B5563" />
        </View>
        <View
          style={[styles.statusDot, { backgroundColor: statusColor.dot }]}
        />
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSKU}>SKU: {product.sku}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
          <View style={styles.productRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor.badge },
              ]}
            >
              <Text
                style={[styles.statusBadgeText, { color: statusColor.text }]}
              >
                {product.status}
              </Text>
            </View>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
        </View>

        <View style={styles.productFooter}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Stock</Text>
            <Text style={[styles.stockValue, { color: statusColor.stock }]}>
              {product.stock} left
            </Text>
          </View>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity style={styles.editButton}>
            <IconSymbol name="pencil" size={16} color="#9CA3AF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restockButton}>
            <IconSymbol name="arrow.clockwise" size={16} color="#FFFFFF" />
            <Text style={styles.restockButtonText}>Restock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <IconSymbol name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function StockScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryMetrics();
  }, []);

  const fetchInventoryMetrics = async () => {
    try {
      setLoading(true);

      // Fetch inventory metrics
      const metricsData = await apiRequestWithAuth(
        API_ENDPOINTS.MOBILE.INVENTORY.METRICS,
      );

      // Also fetch products list
      let products = metricsData.products || [];
      if (!products || products.length === 0) {
        try {
          const productsData = await apiRequestWithAuth(
            API_ENDPOINTS.MOBILE.PRODUCTS.LIST,
          );
          products = productsData.products || productsData || [];
        } catch {
          // Fallback handled below
        }
      }

      // Fallback to mock data ONLY if products list is empty
      if (!products || products.length === 0) {
        products = PRODUCTS;
      }

      setInventoryData({
        ...metricsData,
        products: products,
      });
    } catch (err: any) {
      console.error("Failed to fetch inventory metrics:", err);
      // Set fallback data when not authenticated or error occurs
      setInventoryData({
        metrics: STOCK_METRICS,
        products: PRODUCTS,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <IconSymbol name="shippingbox.fill" size={28} color="#A855F7" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Inventory</Text>
            <Text style={styles.headerSubtitle}>Stock Management</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={fetchInventoryMetrics}
            disabled={loading}
          >
            <IconSymbol
              name={loading ? "hourglass" : "arrow.clockwise"}
              size={22}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <IconSymbol name="bell.fill" size={22} color="#9CA3AF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileImage}>
              <IconSymbol name="person.fill" size={20} color="#6B5FED" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, SKU, category..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <IconSymbol name="slider.horizontal.3" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stock Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Summary</Text>
          <View style={styles.metricsGrid}>
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[styles.metricCard, { backgroundColor: "#1A1F2E" }]}
                  >
                    <Text style={{ color: "#888" }}>Loading...</Text>
                  </View>
                ))
              : (inventoryData?.metrics || STOCK_METRICS).map((metric: any) => (
                  <StockMetricCard key={metric.id} metric={metric} />
                ))}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.id && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === category.id &&
                    styles.categoryPillTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.productsHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <Text style={styles.itemsCount}>
              {loading ? "..." : inventoryData?.products?.length || "248"} Items
            </Text>
          </View>
          <View style={styles.productsContainer}>
            {loading
              ? [1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[styles.productCard, { backgroundColor: "#1A1F2E" }]}
                  >
                    <Text style={{ color: "#888" }}>Loading...</Text>
                  </View>
                ))
              : (inventoryData?.products || PRODUCTS).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add")}>
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2D1B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: "#9CA3AF",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1F2E",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D1B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1F2E",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.md,
    color: "#FFFFFF",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1A1F2E",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#1A1F2E",
    borderRadius: 12,
    padding: 16,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: Typography.sm,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: Typography.xxl,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#374151",
  },
  categoryPillActive: {
    backgroundColor: "#6B5FED",
    borderColor: "#6B5FED",
  },
  categoryPillText: {
    fontSize: Typography.sm,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemsCount: {
    fontSize: Typography.sm,
    color: "#9CA3AF",
  },
  productsContainer: {
    gap: 12,
  },
  productCard: {
    backgroundColor: "#1A1F2E",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
  },
  productImageContainer: {
    position: "relative",
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#1A1F2E",
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productName: {
    fontSize: Typography.md,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  productSKU: {
    fontSize: Typography.xs,
    color: "#6B7280",
    marginBottom: 2,
  },
  productCategory: {
    fontSize: Typography.xs,
    color: "#6B7280",
  },
  productRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: Typography.xs,
    fontWeight: "700",
  },
  productPrice: {
    fontSize: Typography.lg,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  productFooter: {
    marginBottom: 8,
  },
  stockInfo: {
    gap: 2,
  },
  stockLabel: {
    fontSize: Typography.xs,
    color: "#6B7280",
  },
  stockValue: {
    fontSize: Typography.sm,
    fontWeight: "600",
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F1419",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButtonText: {
    fontSize: Typography.xs,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  restockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6B5FED",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  restockButtonText: {
    fontSize: Typography.xs,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#0F1419",
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6B5FED",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6B5FED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
