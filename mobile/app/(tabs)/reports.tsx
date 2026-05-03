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
import { useState, useMemo } from "react";
import { SFSymbol } from "expo-symbols";
import { IconSymbol } from "@/components/ui/icon-symbol";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MetricCard } from "@/components/ui/metric-card";
import { useReports } from "@/hooks/use-reports";
import { useAIInsights } from "@/hooks/use-ai-insights";

const FALLBACK_METRICS = [
  { icon: "dollarsign.circle.fill", title: "Total Revenue", amount: "GH₵84,249", pct: "+12.5%" },
  { icon: "bag.fill", title: "Total Orders", amount: "2,847", pct: "+45.3%" },
  { icon: "person.fill", title: "New Customers", amount: "1,249", pct: "+44.1%" },
  { icon: "chart.bar.fill", title: "Conversion Rate", amount: "3.8%", pct: "-5.1%" },
];

const FUNNEL_LABELS = ["Website Visits", "Product Views", "Add to Cart", "Orders Completed"];

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = ["W1", "W2", "W3", "W4"];

/** Distribute a total across N buckets with realistic variance */
function distributeValues(total: number, n: number): number[] {
  // Create a seed pattern for natural-looking distribution
  const patterns: Record<number, number[]> = {
    7: [0.11, 0.13, 0.16, 0.18, 0.15, 0.14, 0.13],
    4: [0.22, 0.28, 0.30, 0.20],
  };
  const weights = patterns[n] || Array(n).fill(1 / n);
  return weights.map((w) => Math.round(total * w));
}

function SalesChart({ totalRevenue, totalOrders, timeframe, theme }: {
  totalRevenue: number;
  totalOrders: number;
  timeframe: "week" | "month";
  theme: any;
}) {
  const labels = timeframe === "week" ? WEEK_LABELS : MONTH_LABELS;
  const values = useMemo(
    () => distributeValues(totalRevenue, labels.length),
    [totalRevenue, labels.length]
  );
  const orderValues = useMemo(
    () => distributeValues(totalOrders, labels.length),
    [totalOrders, labels.length]
  );

  const maxVal = Math.max(...values, 1);
  const CHART_HEIGHT = 140;
  const BAR_COLORS = ["#5E6AD2", "#3B82F6", "#0891B2", "#059669", "#5E6AD2", "#7C3AED", "#3B82F6"];

  const formatK = (v: number) => {
    if (v >= 1000) return `GH₵${(v / 1000).toFixed(0)}k`;
    return `GH₵${v}`;
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 }}>
      {/* Y-axis grid lines */}
      <View style={{ flex: 1, position: "relative" }}>
        {[1, 0.75, 0.5, 0.25, 0].map((pct, i) => (
          <View key={i} style={{ position: "absolute", top: CHART_HEIGHT * (1 - pct), left: 0, right: 0, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: theme.mutedForeground, fontSize: 9, width: 32, textAlign: "right", marginRight: 6 }}>
              {formatK(Math.round(maxVal * pct))}
            </Text>
            <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: theme.border }} />
          </View>
        ))}

        {/* Bars */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-evenly", height: CHART_HEIGHT, paddingLeft: 38, paddingRight: 4 }}>
          {values.map((val, i) => {
            const barHeight = Math.max((val / maxVal) * CHART_HEIGHT, 4);
            const barColor = BAR_COLORS[i % BAR_COLORS.length];
            return (
              <View key={i} style={{ alignItems: "center", flex: 1 }}>
                <Text style={{ color: theme.mutedForeground, fontSize: 8, marginBottom: 3, fontWeight: "600" }}>
                  {formatK(val)}
                </Text>
                <View style={{
                  width: timeframe === "week" ? 24 : 36,
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: 6,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
                }} />
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={{ flexDirection: "row", justifyContent: "space-evenly", paddingLeft: 38, paddingRight: 4, marginTop: 6 }}>
        {labels.map((label, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: theme.mutedForeground, fontSize: 10, fontWeight: "500" }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#5E6AD2" }} />
          <Text style={{ color: theme.mutedForeground, fontSize: 10 }}>Revenue</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.success }} />
          <Text style={{ color: theme.mutedForeground, fontSize: 10 }}>{totalOrders} Orders</Text>
        </View>
      </View>
    </View>
  );
}

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
          { icon: "dollarsign.circle.fill", title: "Total Revenue", amount: apiMetrics.totalRevenue || "GH₵0", pct: apiMetrics.revenueChange || "+0%" },
          { icon: "bag.fill", title: "Total Orders", amount: String(apiMetrics.totalOrders || 0), pct: apiMetrics.ordersChange || "+0%" },
          { icon: "person.fill", title: "New Customers", amount: String(apiMetrics.newCustomers || 0), pct: apiMetrics.customersChange || "+0%" },
          { icon: "chart.bar.fill", title: "Conversion Rate", amount: apiMetrics.conversionRate || "0%", pct: apiMetrics.conversionChange || "+0%" },
        ]
      : FALLBACK_METRICS;

  const topProducts = reportsData?.topProducts || [
    { name: "Wireless Earbud", units: 847, rev: "GH₵126,450" },
    { name: "Smart Watch M1", units: 634, rev: "GH₵19,020" },
    { name: "Gaming Keyboard", units: 621, rev: "GH₵18,630" },
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
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: theme.mutedForeground }}>Loading chart...</Text>
            </View>
          ) : (
            <SalesChart
              totalRevenue={parseFloat(String(reportsData?.metrics?.totalRevenue || "0").replace(/[^0-9.]/g, "")) || 0}
              totalOrders={parseInt(String(reportsData?.metrics?.totalOrders || "0").replace(/[^0-9]/g, ""), 10) || 0}
              timeframe={timeframe}
              theme={theme}
            />
          )}
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
            const funnelColors = ["#5E6AD2", "#3B82F6", "#0891B2", "#059669"];
            const barColor = funnelColors[i] || theme.primary;
            const conversionRate = i > 0 ? ((step.val / funnel[i - 1].val) * 100).toFixed(0) : "100";
            return (
              <View key={i} style={styles.funnelStep}>
                <View style={styles.funnelStepHeader}>
                  <Text style={{ color: theme.mutedForeground, fontSize: 13 }}>{step.label}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {i > 0 && (
                      <Text style={{ color: barColor, fontSize: 11, fontWeight: "600" }}>{conversionRate}%</Text>
                    )}
                    <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 14 }}>{step.val.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={[styles.funnelBarBg, { backgroundColor: theme.muted }]}>
                  <View style={[styles.funnelBarFill, { backgroundColor: barColor, width: `${pct}%` }]} />
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
  chartBox: { height: 260, borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: "hidden" },
  tableContainer: { borderRadius: 12, borderWidth: 1, marginBottom: 24, paddingHorizontal: 16 },
  tableRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  prodInfoRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  prodImgPlaceholder: { width: 32, height: 32, borderRadius: 6 },
  funnelContainer: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 16, marginBottom: 24 },
  funnelStep: { gap: 8 },
  funnelStepHeader: { flexDirection: "row", justifyContent: "space-between" },
  funnelBarBg: { height: 10, borderRadius: 5, overflow: "hidden" },
  funnelBarFill: { height: "100%", borderRadius: 5 },
  aiCard: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 24 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  aiTitle: { fontWeight: "700", fontSize: 16 },
  aiText: { fontSize: 14, lineHeight: 20 },
});
