import { Colors } from "@/constants/theme";
import Typography from "@/constants/typography";
import {
  View,
  ScrollView,
  Text,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { SFSymbol } from "expo-symbols";
import { IconSymbol } from "@/components/ui/icon-symbol";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MetricCard } from "@/components/ui/metric-card";
import { useReports } from "@/hooks/use-reports";
import { useAIInsights } from "@/hooks/use-ai-insights";

const FALLBACK_METRICS = [
  { icon: "dollarsign.circle.fill", title: "Total Revenue", amount: "$84,249", pct: "+12.5%" },
  { icon: "bag.fill", title: "Total Orders", amount: "2,847", pct: "+45.3%" },
  { icon: "person.fill", title: "New Customers", amount: "1,249", pct: "+44.1%" },
  { icon: "chart.bar.fill", title: "Conversion Rate", amount: "3.8%", pct: "-5.1%" },
];

const FUNNEL_LABELS = ["Website Visits", "Product Views", "Add to Cart", "Orders Completed"];

export default function ReportsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const { data: reportsData, isLoading, refetch } = useReports(date);
  const { insights: aiInsights } = useAIInsights();

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const apiMetrics = reportsData?.metrics;
  const displayMetrics = apiMetrics && Array.isArray(apiMetrics)
    ? apiMetrics
    : apiMetrics
      ? [
          { icon: "dollarsign.circle.fill", title: "Total Revenue", amount: apiMetrics.totalRevenue || "$0", pct: apiMetrics.revenueChange || "+0%" },
          { icon: "bag.fill", title: "Total Orders", amount: String(apiMetrics.totalOrders || 0), pct: apiMetrics.ordersChange || "+0%" },
          { icon: "person.fill", title: "New Customers", amount: String(apiMetrics.newCustomers || 0), pct: apiMetrics.customersChange || "+0%" },
          { icon: "chart.bar.fill", title: "Conversion Rate", amount: apiMetrics.conversionRate || "0%", pct: apiMetrics.conversionChange || "+0%" },
        ]
      : FALLBACK_METRICS;

  const topProducts = reportsData?.topProducts || [
    { name: "Wireless Earbud", units: 847, rev: "$126,450" },
    { name: "Smart Watch M1", units: 634, rev: "$19,020" },
    { name: "Gaming Keyboard", units: 621, rev: "$18,630" },
  ];

  const funnel = reportsData?.funnel || [
    { label: "Website Visits", val: 45820 },
    { label: "Product Views", val: 28340 },
    { label: "Add to Cart", val: 12470 },
    { label: "Orders Completed", val: 2847 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconContainer, { backgroundColor: theme.muted }]}>
            <IconSymbol name="chart.pie.fill" size={24} color={theme.foreground} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.foreground }]}>Reports</Text>
            <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>Analytics & Insights</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: theme.muted }]} onPress={() => refetch()}>
            <IconSymbol name="arrow.clockwise" size={20} color={theme.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Filters */}
        <View style={[styles.filterBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: theme.mutedForeground }]}>Date Range:</Text>
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.muted }]} onPress={() => setShowPicker(true)}>
              <Text style={{ color: theme.foreground }}>{date.toLocaleDateString()}</Text>
              <IconSymbol name="calendar" size={14} color={theme.mutedForeground} />
            </TouchableOpacity>
          </View>
          {showPicker && (
            <DateTimePicker testID="dateTimePicker" value={date} mode="date" is24Hour onChange={onDateChange} display="default" />
          )}
        </View>

        {/* Key Metrics */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Key Metrics</Text>
        {isLoading ? (
          <View style={[styles.loadingBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={{ color: theme.mutedForeground }}>Loading metrics...</Text>
          </View>
        ) : (
          <View style={styles.metricsGrid}>
            {displayMetrics.map((item: any, i: number) => (
              <MetricCard key={i} title={item.title} icon={item.icon} value={item.amount} trend={item.pct} />
            ))}
          </View>
        )}

        {/* Sales Performance */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.foreground, marginBottom: 0 }]}>Sales Performance</Text>
          <View style={[styles.timeToggleWrap, { backgroundColor: theme.muted }]}>
            <TouchableOpacity onPress={() => setTimeframe("week")} style={[styles.timeToggleBtn, timeframe === "week" && { backgroundColor: theme.card }]}>
              <Text style={[{ color: theme.mutedForeground }, timeframe === "week" && { color: theme.foreground, fontWeight: "600" }]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTimeframe("month")} style={[styles.timeToggleBtn, timeframe === "month" && { backgroundColor: theme.card }]}>
              <Text style={[{ color: theme.mutedForeground }, timeframe === "month" && { color: theme.foreground, fontWeight: "600" }]}>Month</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.chartBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <IconSymbol name="chart.xyaxis.line" size={48} color={theme.mutedForeground} />
          <Text style={{ color: theme.mutedForeground, marginTop: 8 }}>Chart visualization</Text>
        </View>

        {/* Top Products */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Top Products</Text>
        <View style={[styles.tableContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {topProducts.map((prod: any, i: number) => (
            <View key={i} style={[styles.tableRow, { borderBottomColor: theme.border }, i === topProducts.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.prodInfoRow}>
                <View style={[styles.prodImgPlaceholder, { backgroundColor: theme.muted }]} />
                <Text style={[{ color: theme.foreground, fontWeight: "500" }]} numberOfLines={1}>{prod.name}</Text>
              </View>
              <Text style={{ color: theme.mutedForeground }}>{prod.units} sold</Text>
              <Text style={{ color: theme.primary, fontWeight: "600" }}>{prod.rev}</Text>
            </View>
          ))}
        </View>

        {/* Conversion Funnel */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Conversion Funnel</Text>
        <View style={[styles.funnelContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {funnel.map((step: any, i: number) => {
            const maxVal = funnel[0]?.val || 1;
            const pct = (step.val / maxVal) * 100;
            return (
              <View key={i} style={styles.funnelStep}>
                <View style={styles.funnelStepHeader}>
                  <Text style={{ color: theme.mutedForeground }}>{step.label}</Text>
                  <Text style={{ color: theme.foreground, fontWeight: "600" }}>{step.val.toLocaleString()}</Text>
                </View>
                <View style={[styles.funnelBarBg, { backgroundColor: theme.muted }]}>
                  <View style={[styles.funnelBarFill, { backgroundColor: theme.primary, width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* AI Insights — from API */}
        <View style={[styles.aiCard, { backgroundColor: theme.primary + "10", borderColor: theme.primary }]}>
          <View style={styles.aiHeader}>
            <IconSymbol name="sparkles" size={20} color={theme.primary} />
            <Text style={[styles.aiTitle, { color: theme.primary }]}>AI Insights & Recommendations</Text>
          </View>
          {aiInsights.length > 0 ? aiInsights.map((insight, i) => (
            <Text key={insight.id || i} style={[styles.aiText, { color: theme.foreground }]}>
              • {insight.description}
            </Text>
          )) : (
            <>
              <Text style={[styles.aiText, { color: theme.foreground }]}>• Analyzing your data for patterns...</Text>
              <Text style={[styles.aiText, { color: theme.foreground }]}>• AI insights will appear here once enough data is collected.</Text>
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  headerIconButton: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  filterBox: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 24 },
  filterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  filterLabel: { fontWeight: "500" },
  filterBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, marginTop: 8 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 8 },
  timeToggleWrap: { flexDirection: "row", borderRadius: 8, padding: 4 },
  timeToggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 24 },
  loadingBox: { borderRadius: 12, borderWidth: 1, padding: 24, alignItems: "center", marginBottom: 24 },
  chartBox: { height: 200, borderRadius: 16, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  tableContainer: { borderRadius: 12, borderWidth: 1, marginBottom: 24, paddingHorizontal: 16 },
  tableRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  prodInfoRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  prodImgPlaceholder: { width: 32, height: 32, borderRadius: 6 },
  funnelContainer: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 16, marginBottom: 24 },
  funnelStep: { gap: 8 },
  funnelStepHeader: { flexDirection: "row", justifyContent: "space-between" },
  funnelBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  funnelBarFill: { height: "100%", borderRadius: 4 },
  aiCard: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 24 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  aiTitle: { fontWeight: "700", fontSize: 16 },
  aiText: { fontSize: 14, lineHeight: 20 },
});
