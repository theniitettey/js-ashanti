import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
  Alert,
  Modal,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MetricCard } from "@/components/ui/metric-card";
import { InventoryProductCard } from "@/components/ui/inventory-product-card";
import { useInventoryMetrics, InventoryProduct, InventoryMetric } from "@/hooks/use-inventory";
import { useUpdateStock, useDeleteProduct } from "@/hooks/use-products";

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
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [restockProduct, setRestockProduct] = useState<InventoryProduct | null>(null);
  const [restockQty, setRestockQty] = useState("");

  const { metrics, products, isLoading, refetch } = useInventoryMetrics();
  const { updateStock, isPending: isRestocking } = useUpdateStock();
  const { deleteProduct, isPending: isDeleting } = useDeleteProduct();

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

  const handleEdit = (product: InventoryProduct) => {
    Alert.alert(
      "Edit Product",
      `Edit "${product.name}"?\n\nThis will open the product editor.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          onPress: () => router.push({ pathname: "/(tabs)/add", params: { editId: product.id } }),
        },
      ],
    );
  };

  const handleRestockOpen = (product: InventoryProduct) => {
    setRestockProduct(product);
    setRestockQty("");
    setRestockModalVisible(true);
  };

  const handleRestockSubmit = async () => {
    if (!restockProduct || !restockQty) return;
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a positive number.");
      return;
    }
    try {
      await updateStock({ productId: restockProduct.id, additionalStock: qty });
      Alert.alert("Restocked", `Added ${qty} units to "${restockProduct.name}".`);
      setRestockModalVisible(false);
      setRestockProduct(null);
    } catch (err: any) {
      Alert.alert("Restock Failed", err.message || "Please try again.");
    }
  };

  const handleDelete = (product: InventoryProduct) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert("Deleted", `"${product.name}" has been removed.`);
            } catch (err: any) {
              Alert.alert("Delete Failed", err.message || "Please try again.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      {/* Header */}
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
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: theme.muted }]} onPress={() => router.push("/orders")}>
            <IconSymbol name="bell.fill" size={20} color={theme.foreground} />
            <View style={[styles.notificationBadge, { backgroundColor: theme.destructive }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark" size={16} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stock Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Stock Summary</Text>
          <View style={styles.metricsGrid}>
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <View key={i} style={[{ flex: 1, borderRadius: 12, borderWidth: 1, padding: 16 }, { backgroundColor: theme.card, borderColor: theme.border }]}>
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

        {/* Products */}
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
                  status={product.status}
                  onEdit={() => handleEdit(product)}
                  onRestock={() => handleRestockOpen(product)}
                  onDelete={() => handleDelete(product)}
                />
              ))
            ) : (
              <View style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border, padding: 24, justifyContent: "center", alignItems: "center" }]}>
                <IconSymbol name="magnifyingglass" size={24} color={theme.mutedForeground} />
                <Text style={{ color: theme.mutedForeground, marginTop: 8 }}>
                  {searchQuery ? `No results for "${searchQuery}"` : "No products found"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Restock Modal */}
      <Modal visible={restockModalVisible} animationType="slide" transparent onRequestClose={() => setRestockModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>Restock Product</Text>
              <TouchableOpacity onPress={() => setRestockModalVisible(false)}>
                <IconSymbol name="xmark" size={22} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {restockProduct && (
                <Text style={[styles.modalProductName, { color: theme.foreground }]}>
                  {restockProduct.name}
                </Text>
              )}
              <Text style={[{ color: theme.mutedForeground, marginBottom: 8 }]}>
                Current stock: {restockProduct?.stock ?? 0} units
              </Text>
              <Text style={[styles.modalLabel, { color: theme.foreground }]}>Quantity to add</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.foreground }]}
                placeholder="Enter quantity"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="number-pad"
                value={restockQty}
                onChangeText={setRestockQty}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.modalSubmit, { backgroundColor: theme.primary, opacity: isRestocking ? 0.6 : 1 }]}
                onPress={handleRestockSubmit}
                disabled={isRestocking || !restockQty}
              >
                <Text style={[styles.modalSubmitText, { color: theme.primaryForeground }]}>
                  {isRestocking ? "Restocking..." : "Confirm Restock"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconButton: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", position: "relative" },
  notificationBadge: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  searchContainer: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoriesContainer: { marginBottom: 24 },
  categoriesContent: { paddingRight: 16, gap: 8 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryPillText: { fontSize: 14 },
  productsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  itemsCount: { fontSize: 14 },
  productsContainer: { gap: 12 },
  productCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  modalBody: { padding: 16 },
  modalProductName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  modalLabel: { fontSize: 14, fontWeight: "500", marginBottom: 8, marginTop: 16 },
  modalInput: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 20 },
  modalSubmit: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  modalSubmitText: { fontSize: 15, fontWeight: "600" },
});
