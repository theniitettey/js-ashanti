import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  useColorScheme,
  Image,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Divider from "@/components/ui/divider";
import { SFSymbol } from "expo-symbols";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAIInsights } from "@/hooks/use-ai-insights";
import { useOrders } from "@/hooks/use-orders";
import { useInventoryMetrics, InventoryProduct } from "@/hooks/use-inventory";
import { MetricCard } from "@/components/ui/metric-card";
import { InventoryProductCard } from "@/components/ui/inventory-product-card";

const LiveIndicator = ({ connected }: { connected: boolean }) => {
  const [opacity] = useState(new Animated.Value(1));
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [opacity, connected]);

  return (
    <Animated.View
      style={{
        ...styles.liveIndicator,
        backgroundColor: connected ? theme.success : theme.destructive,
        opacity: connected ? opacity : 1,
      }}
    />
  );
};

const BarChartBar = ({ height, label, color, theme }: { height: number; label: string; color: string; theme: any }) => (
  <View style={styles.barChartBarWrap}>
    <View style={[styles.barChartBarFill, { backgroundColor: color, height }]} />
    <Text style={[styles.barChartLabel, { color: theme.mutedForeground }]}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();

  const { metrics, isLoading } = useDashboard();
  const { insights } = useAIInsights();
  const { summary: orderSummary } = useOrders();
  const { products: inventoryProducts } = useInventoryMetrics();
  const pendingOrders = orderSummary.PENDING + orderSummary.PAID;

  const wsConnected = !isLoading;

  const lowStockProducts = inventoryProducts
    .filter((p: InventoryProduct) => p.status === "CRITICAL" || p.status === "LOW" || p.stock < 15)
    .slice(0, 3);

  const formatCurrency = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconWrap, { backgroundColor: theme.muted }]}>
            <IconSymbol size={22} name="chart.bar.fill" color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.foreground }]}>Admin Dashboard</Text>
            <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>Store Overview</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push("/orders")} style={styles.bellIconWrap} accessibilityLabel="Open orders" hitSlop={10}>
            <IconSymbol size={22} name="bell.fill" color={theme.mutedForeground} />
            {pendingOrders > 0 && (
              <View style={[styles.bellBadgeCount, { backgroundColor: theme.destructive }]}>
                <Text style={styles.bellBadgeText}>{pendingOrders > 9 ? "9+" : pendingOrders}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Image source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }} style={styles.profileImg} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionContainer}>

          {/* Live Traffic */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Live Traffic</Text>
              <View style={styles.liveStatusWrap}>
                <LiveIndicator connected={wsConnected} />
                <Text style={[styles.liveStatusText, { color: wsConnected ? theme.success : theme.destructive }]}>
                  {wsConnected ? "Live" : "Offline"}
                </Text>
              </View>
            </View>
            <View style={[styles.cardContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardLabel, { color: theme.mutedForeground }]}>Current Visitors</Text>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={[styles.cardMainValue, { color: theme.foreground }]}>
                    {isLoading ? "-" : metrics?.currentVisitors?.toLocaleString() || "0"}
                  </Text>
                  <View style={styles.trendRow}>
                    <IconSymbol size={12} name="arrow.up.right" color={theme.success} />
                    <Text style={[styles.trendText, { color: theme.success }]}>+12%</Text>
                  </View>
                </View>
                <IconSymbol size={48} name="chart.bar.fill" color={theme.primary} />
              </View>
              <Divider />
              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={[styles.cardBottomLabel, { color: theme.mutedForeground }]}>Active Sessions</Text>
                  <Text style={[styles.cardBottomValue, { color: theme.foreground }]}>
                    {isLoading ? "-" : metrics?.activeVisitors?.toLocaleString() || "0"}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.cardBottomLabel, { color: theme.mutedForeground }]}>Page Views/min</Text>
                  <Text style={[styles.cardBottomValue, { color: theme.foreground }]}>
                    {isLoading ? "-" : metrics?.pageViewsPerMin || "0"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sales Overview — from API */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Sales Overview</Text>
              <TouchableOpacity style={[styles.timeFilterBtn, { backgroundColor: theme.muted }]}>
                <Text style={[styles.timeFilterText, { color: theme.foreground }]}>Today</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.metricsRow}>
              <MetricCard
                title="Total Revenue"
                value={isLoading ? "-" : formatCurrency(metrics?.totalRevenue ?? 0)}
                trend="+8.2% from yesterday"
                icon="dollarsign.circle.fill"
                iconColor={theme.primary}
              />
              <MetricCard
                title="Orders"
                value={isLoading ? "-" : String(orderSummary.PENDING + orderSummary.PAID + orderSummary.FULFILLED)}
                trend="+15.3% from yesterday"
                icon="bag.fill"
                iconColor={theme.primary}
              />
            </View>
          </View>

          {/* AI Insights — from API */}
          <View style={[styles.cardContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.insightBadge, { backgroundColor: theme.primary }]}>
              <IconSymbol size={12} name="sparkles" color={theme.primaryForeground} />
              <Text style={[styles.insightBadgeText, { color: theme.primaryForeground }]}>AI INSIGHTS</Text>
            </View>
            <View style={styles.insightList}>
              {insights.length > 0 ? insights.slice(0, 2).map((insight, i) => (
                <View key={insight.id || i} style={styles.insightRow}>
                  <View style={[styles.insightDot, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.insightText, { color: theme.mutedForeground }]}>{insight.description}</Text>
                </View>
              )) : (
                <>
                  <View style={styles.insightRow}>
                    <View style={[styles.insightDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.insightText, { color: theme.mutedForeground }]}>Loading AI insights...</Text>
                  </View>
                </>
              )}
            </View>
            <TouchableOpacity
              style={[styles.askAiBtn, { backgroundColor: theme.muted }]}
              onPress={() => router.push("/(tabs)/reports")}
            >
              <IconSymbol size={16} name="sparkles" color={theme.foreground} />
              <Text style={[styles.askAiText, { color: theme.foreground }]}>View Full Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* Inventory Status — from API */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Inventory Status</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/stock")}>
                <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {lowStockProducts.length > 0 ? lowStockProducts.map((p: InventoryProduct, i: number) => (
                <InventoryProductCard
                  key={p.id || i}
                  name={p.name}
                  sku={p.sku}
                  status={p.status || "HEALTHY"}
                  stockCount={p.stock}
                />
              )) : (
                <>
                  <InventoryProductCard name="All stock levels healthy" sku="—" status="HEALTHY" stockCount={0} />
                </>
              )}
            </View>
          </View>

          {/* Revenue by Category */}
          <View>
            <Text style={[styles.sectionTitle, { color: theme.foreground, marginBottom: 12 }]}>Revenue by Category</Text>
            <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.chartBarsWrap}>
                <BarChartBar height={95} label="Elec" color={theme.primary} theme={theme} />
                <BarChartBar height={70} label="Cloth" color={theme.primary} theme={theme} />
                <BarChartBar height={55} label="Home" color={theme.mutedForeground} theme={theme} />
                <BarChartBar height={45} label="Acc" color={theme.mutedForeground} theme={theme} />
                <BarChartBar height={35} label="Sport" color={theme.mutedForeground} theme={theme} />
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconWrap: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSubtitle: { fontSize: 12 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  bellIconWrap: { position: "relative" },
  bellBadgeCount: { position: "absolute", top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, alignItems: "center", justifyContent: "center" },
  bellBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700", lineHeight: 12 },
  profileImg: { width: 36, height: 36, borderRadius: 18 },
  scrollContent: { paddingVertical: 20, paddingBottom: 100 },
  sectionContainer: { paddingHorizontal: 16, gap: 24 },
  liveIndicator: { width: 10, height: 10, borderRadius: 5 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  liveStatusWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveStatusText: { fontSize: 12, fontWeight: "600" },
  cardContainer: { borderRadius: 16, borderWidth: 1, padding: 18 },
  cardLabel: { fontSize: 13, marginBottom: 8, fontWeight: "500" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  cardMainValue: { fontSize: 32, fontWeight: "700" },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  trendText: { fontSize: 13, fontWeight: "600" },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  cardBottomLabel: { fontSize: 12, marginBottom: 6, fontWeight: "500" },
  cardBottomValue: { fontSize: 18, fontWeight: "700" },
  timeFilterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  timeFilterText: { fontSize: 12, fontWeight: "600" },
  metricsRow: { flexDirection: "row", gap: 12 },
  insightBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 16 },
  insightBadgeText: { fontSize: 10, fontWeight: "700" },
  insightList: { gap: 12, marginBottom: 16 },
  insightRow: { flexDirection: "row", gap: 10 },
  insightDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  insightText: { fontSize: 13, flex: 1, lineHeight: 18 },
  askAiBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 10 },
  askAiText: { fontSize: 14, fontWeight: "600" },
  viewAllText: { fontSize: 13, fontWeight: "600" },
  listCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  chartContainer: { borderRadius: 16, borderWidth: 1, padding: 20, minHeight: 200, justifyContent: "flex-end" },
  chartBarsWrap: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 120 },
  barChartBarWrap: { alignItems: "center", gap: 8 },
  barChartBarFill: { width: 28, borderRadius: 6 },
  barChartLabel: { fontSize: 11, fontWeight: "500" },
});
