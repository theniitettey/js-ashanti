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

const STATIC_SALES_DATA = [
  { icon: "dollarsign.circle.fill", title: "Total Revenue", amount: "$84,249", pct: "+12.5%" },
  { icon: "bag.fill", title: "Total Orders", amount: "2,847", pct: "+45.3%" },
  { icon: "person.fill", title: "New Customers", amount: "1,249", pct: "+44.1%" },
  { icon: "chart.bar.fill", title: "Conversion Rate", amount: "3.8%", pct: "-5.1%" },
];

const TOP_PRODUCTS = [
  { name: "Wireless Earbud", units: 847, rev: "$126,450" },
  { name: "Smart Watch M1", units: 634, rev: "$19,020" },
  { name: "Gaming Keyboard", units: 621, rev: "$18,630" },
];

const FUNNEL = [
  { label: "Website Visits", val: 45820 },
  { label: "Product Views", val: 28340 },
  { label: "Add to Cart", val: 12470 },
  { label: "Orders Completed", val: 2847 },
];

export default function ReportsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // TanStack Query — date in queryKey means changing date auto-refetches
  const { isLoading, refetch } = useReports(date);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

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
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: theme.muted }]}>
            <IconSymbol name="arrow.down.doc.fill" size={20} color={theme.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Filters */}
        <View style={[styles.filterBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: theme.mutedForeground }]}>Date Range:</Text>
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: theme.muted }]}
              onPress={() => setShowPicker(true)}
            >
              <Text style={{ color: theme.foreground }}>{date.toLocaleDateString()}</Text>
              <IconSymbol name="calendar" size={14} color={theme.mutedForeground} />
            </TouchableOpacity>
          </View>
          {showPicker && (
             <DateTimePicker
               testID="dateTimePicker"
               value={date}
               mode="date"
               is24Hour={true}
               onChange={onDateChange}
               display="default"
             />
          )}

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: theme.mutedForeground }]}>Report Type:</Text>
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.muted }]}>
              <Text style={{ color: theme.foreground }}>Income Report</Text>
              <IconSymbol name="chevron.down" size={14} color={theme.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          {STATIC_SALES_DATA.map((item, i) => (
            <MetricCard key={i} title={item.title} icon={item.icon} value={item.amount} trend={item.pct} />
          ))}
        </View>

        {/* Chart Area Placeholder */}
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
          <Text style={{ color: theme.mutedForeground, marginTop: 8 }}>Chart UI rendering here</Text>
        </View>

        {/* Top Products */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Top Products</Text>
        <View style={[styles.tableContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {TOP_PRODUCTS.map((prod, i) => (
            <View key={i} style={[styles.tableRow, { borderBottomColor: theme.border }, i === TOP_PRODUCTS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.prodInfoRow}>
                <View style={[styles.prodImgPlaceholder, { backgroundColor: theme.muted }]} />
                <Text style={[{ color: theme.foreground, fontWeight: "500" }]} numberOfLines={1}>{prod.name}</Text>
              </View>
              <Text style={{ color: theme.mutedForeground }}>{prod.units} sold</Text>
              <Text style={{ color: theme.primary, fontWeight: "600" }}>{prod.rev}</Text>
            </View>
          ))}
        </View>

        {/* Funnel */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Conversion Funnel</Text>
        <View style={[styles.funnelContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {FUNNEL.map((step, i) => {
            const pct = (step.val / FUNNEL[0].val) * 100;
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

        {/* AI Insights */}
        <View style={[styles.aiCard, { backgroundColor: theme.primary + "10", borderColor: theme.primary }]}>
          <View style={styles.aiHeader}>
            <IconSymbol name="sparkles" size={20} color={theme.primary} />
            <Text style={[styles.aiTitle, { color: theme.primary }]}>AI Insights & Recommendations</Text>
          </View>
          <Text style={[styles.aiText, { color: theme.foreground }]}>• High cart abandonment observed on mobile (73%). Standardize checkout flows.</Text>
          <Text style={[styles.aiText, { color: theme.foreground }]}>• Strong synergy between Gaming Keyboards and Mice - suggest creating a new bundle.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconContainer: {
    width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconButton: {
    width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center",
  },
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
  metricCard: { width: "48%", padding: 16, borderRadius: 16, borderWidth: 1 },
  metricIconWrap: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  metricTitle: { fontSize: 13, marginBottom: 4 },
  metricAmount: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  pctRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  pctText: { fontSize: 12, fontWeight: "600" },
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
