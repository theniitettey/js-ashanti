import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { SFSymbol } from "expo-symbols";
import { Colors } from "@/constants/theme";

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string; // e.g. "+12.5%"
  icon: SFSymbol | any;
  iconColor?: string;
  progressPercentage?: number; // 0 to 1 value
}

export function MetricCard({
  title,
  value,
  trend,
  icon,
  iconColor,
  progressPercentage,
}: MetricCardProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const primaryColor = iconColor || theme.primary;
  const isPositive = trend?.startsWith("+");
  const trendColor = isPositive ? theme.success : theme.destructive;

  return (
    <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.metricIconWrap, { backgroundColor: primaryColor + "15" }]}>
        <IconSymbol name={icon} size={20} color={primaryColor} />
      </View>
      <Text style={[styles.metricTitle, { color: theme.mutedForeground }]}>{title}</Text>
      <Text style={[styles.metricValue, { color: theme.foreground }]}>{value}</Text>
      
      {trend ? (
        <View style={styles.trendRow}>
          <IconSymbol name={isPositive ? "arrow.up.right" : "arrow.down.right"} size={14} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>{trend}</Text>
        </View>
      ) : progressPercentage !== undefined ? (
        <View style={[styles.progressBarContainer, { backgroundColor: theme.muted }]}>
          <View style={[styles.progressBarFill, { backgroundColor: primaryColor, width: `${progressPercentage * 100}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 13,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
});
