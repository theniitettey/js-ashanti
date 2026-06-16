import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { Colors } from "@/constants/theme";

const AVATAR_GRADIENTS = [
  ["#5E6AD2", "#7C3AED"],
  ["#059669", "#10B981"],
  ["#D97706", "#F59E0B"],
  ["#DC2626", "#EF4444"],
  ["#2563EB", "#3B82F6"],
  ["#7C3AED", "#A855F7"],
  ["#0891B2", "#06B6D4"],
  ["#BE185D", "#EC4899"],
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colors = AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
  return colors[0];
}

export interface InventoryProductCardProps {
  id?: string;
  name: string;
  sku: string;
  category?: string;
  price?: string;
  stockCount: number;
  status: "CRITICAL" | "LOW" | "HEALTHY" | "OUT";
  onEdit?: () => void;
  onRestock?: () => void;
  onDelete?: () => void;
}

export function InventoryProductCard({
  name,
  sku,
  category,
  price,
  stockCount,
  status,
  onEdit,
  onRestock,
  onDelete,
}: InventoryProductCardProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const avatarBg = getAvatarColor(name || "P");
  const initial = (name || "P").charAt(0).toUpperCase();

  const getStatusTheme = (s: string) => {
    switch (s) {
      case "CRITICAL":
      case "OUT":
        return { text: theme.destructive, bg: theme.destructive + "20" };
      case "LOW":
      case "LOW STOCK": // fallback mapping if passed down
        return { text: theme.warning, bg: theme.warning + "20" };
      case "HEALTHY":
        return { text: theme.success, bg: theme.success + "20" };
      default:
        return { text: theme.foreground, bg: theme.muted };
    }
  };

  const statusTheme = getStatusTheme(status);

  return (
    <View style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.productImageContainer}>
        <View style={[styles.productAvatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusTheme.text, borderColor: theme.card }]} />
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.productName, { color: theme.foreground }]} numberOfLines={1}>
              {name || "Unknown Product"}
            </Text>
            <Text style={[styles.productSKU, { color: theme.mutedForeground }]}>SKU: {sku}</Text>
            {category && (
              <Text style={[styles.productCategory, { color: theme.mutedForeground }]}>{category}</Text>
            )}
          </View>
          <View style={styles.productRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusTheme.text }]}>{status || "HEALTHY"}</Text>
            </View>
            {price && <Text style={[styles.productPrice, { color: theme.foreground }]}>{price}</Text>}
          </View>
        </View>

        <View style={styles.productFooter}>
          <Text style={[styles.stockLabel, { color: theme.mutedForeground }]}>Stock: </Text>
          <Text style={[styles.stockValue, { color: statusTheme.text }]}>{stockCount || 0} left</Text>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity onPress={onEdit} style={[styles.actionBtn, { backgroundColor: theme.muted }]}>
            <IconSymbol name="pencil" size={14} color={theme.foreground} />
            <Text style={[styles.actionBtnText, { color: theme.foreground }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRestock} style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
            <IconSymbol name="arrow.clockwise" size={14} color={theme.primaryForeground} />
            <Text style={[styles.actionBtnText, { color: theme.primaryForeground }]}>Restock</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={[styles.iconBtn, { backgroundColor: theme.destructive + "20" }]}>
            <IconSymbol name="trash" size={16} color={theme.destructive} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  productImageContainer: {
    position: "relative",
  },
  productAvatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  statusDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  productSKU: {
    fontSize: 12,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
  },
  productRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stockLabel: {
    fontSize: 12,
  },
  stockValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
