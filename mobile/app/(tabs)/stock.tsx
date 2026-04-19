import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MetricCard } from "@/components/ui/metric-card";
import { InventoryProductCard } from "@/components/ui/inventory-product-card";
import { useInventoryMetrics, InventoryProduct, InventoryMetric } from "@/hooks/use-inventory";

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "electronics", label: "Electronics" },
  { id: "clothing", label: "Clothing" },
  { id: "home", label: "Home & Living" },
  { id: "accessories", label: "Accessories" },
];

export default function StockScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // TanStack Query — replaces all manual useState + useEffect + fetch
  const { metrics, products, isLoading, refetch } = useInventoryMetrics();

  const filteredProducts = products.filter((p: InventoryProduct) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      p.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      {/* Premium Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconContainer, { backgroundColor: theme.muted }]}>
            <IconSymbol name="shippingbox.fill" size={24} color={theme.foreground} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.foreground }]}>Inventory</Text>
            <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>Stock Management</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: theme.muted }]} onPress={() => refetch()} disabled={isLoading}>
            <IconSymbol name={isLoading ? "hourglass" : "arrow.clockwise"} size={20} color={theme.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: theme.muted }]}>
            <IconSymbol name="bell.fill" size={20} color={theme.foreground} />
            <View style={[styles.notificationBadge, { backgroundColor: theme.destructive }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={theme.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: theme.foreground }]}
            placeholder="Search products, SKU, category..."
            placeholderTextColor={theme.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.muted }]}>
          <IconSymbol name="slider.horizontal.3" size={18} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Stock Summary Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Stock Summary</Text>
          <View style={styles.metricsGrid}>
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <View key={i} style={[{ width: "48%", borderRadius: 12, borderWidth: 1, padding: 16 }, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={{ color: theme.mutedForeground }}>Loading...</Text>
                </View>
              ))
            ) : (
              metrics.map((metric: InventoryMetric, i: number) => (
                <MetricCard
                  key={metric.id || i}
                  title={metric.label}
                  value={metric.value}
                  icon={metric.icon}
                  iconColor={metric.iconColor}
                  progressPercentage={metric.progress}
                />
              ))
            )}
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer} contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isActive ? theme.primary : theme.card, borderColor: isActive ? theme.primary : theme.border },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[styles.categoryPillText, { color: isActive ? theme.primaryForeground : theme.mutedForeground, fontWeight: isActive ? "600" : "500" }]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Products List */}
        <View style={styles.section}>
          <View style={styles.productsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Products</Text>
            <Text style={[styles.itemsCount, { color: theme.mutedForeground }]}>
              {isLoading ? "..." : filteredProducts.length} Items
            </Text>
          </View>
          <View style={styles.productsContainer}>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <View key={i} style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border, padding: 24, justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ color: theme.mutedForeground }}>Loading...</Text>
                </View>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product: InventoryProduct, i: number) => (
                <InventoryProductCard
                  key={product.id || i}
                  name={product.name}
                  sku={product.sku}
                  category={product.category}
                  price={product.price}
                  stockCount={product.stock}
                  status={product.status || "HEALTHY"}
                />
              ))
            ) : (
              <View style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border, padding: 24, justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: theme.mutedForeground }}>No products found</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconContainer: {
    width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconButton: {
    width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", position: "relative",
  },
  notificationBadge: {
    position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4,
  },
  searchContainer: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  searchBar: {
    flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filterButton: {
    width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 2,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoriesContainer: { marginBottom: 24 },
  categoriesContent: { paddingRight: 16, gap: 8 },
  categoryPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  categoryPillText: { fontSize: 14 },
  productsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  itemsCount: { fontSize: 14 },
  productsContainer: { gap: 12 },
  productCard: {
    borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 12,
  },
});
