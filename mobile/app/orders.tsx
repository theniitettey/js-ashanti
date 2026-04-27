import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import {
  AdminOrder,
  OrderStatus,
  useCancelOrder,
  useFulfillOrder,
  useOrders,
} from "@/hooks/use-orders";

const STATUS_ORDER: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "CANCELLED"];

function getStatusColors(status: OrderStatus, theme: any) {
  switch (status) {
    case "PENDING":
      return { bg: "rgba(245, 158, 11, 0.15)", fg: theme.warning };
    case "PAID":
      return { bg: "rgba(59, 130, 246, 0.15)", fg: "#3B82F6" };
    case "FULFILLED":
      return { bg: "rgba(16, 185, 129, 0.15)", fg: theme.success };
    case "CANCELLED":
      return { bg: "rgba(239, 68, 68, 0.15)", fg: theme.destructive };
  }
}

function formatAmount(amount: number) {
  const value = Number.isFinite(amount) ? amount : 0;
  return `GH₵${value.toFixed(2)}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function OrderCard({
  order,
  theme,
  onFulfill,
  onCancel,
  busy,
}: {
  order: AdminOrder;
  theme: any;
  onFulfill: (id: string) => void;
  onCancel: (id: string) => void;
  busy: boolean;
}) {
  const statusColors = getStatusColors(order.status, theme);
  const canFulfill = order.status === "PAID";
  const canCancel = order.status === "PENDING" || order.status === "PAID";

  return (
    <View style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.orderHeaderRow}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            style={[styles.orderId, { color: theme.foreground }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {order.id}
          </Text>
          <Text style={[styles.orderRef, { color: theme.mutedForeground }]}>
            {(order.paymentProvider || "n/a") + " / " + (order.paymentRef || "n/a")}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusPillText, { color: statusColors.fg }]}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.orderBodyRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderLabel, { color: theme.mutedForeground }]}>Customer</Text>
          <Text style={[styles.orderValue, { color: theme.foreground }]} numberOfLines={1}>
            {order.customerName || "—"}
          </Text>
          <Text style={[styles.orderSubValue, { color: theme.mutedForeground }]} numberOfLines={1}>
            {order.email || "—"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.orderLabel, { color: theme.mutedForeground }]}>Amount</Text>
          <Text style={[styles.orderAmount, { color: theme.foreground }]}>
            {formatAmount(order.totalAmount)}
          </Text>
          <Text style={[styles.orderSubValue, { color: theme.mutedForeground }]}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
      </View>

      <View style={styles.orderActionsRow}>
        <TouchableOpacity
          disabled={!canFulfill || busy}
          onPress={() => onFulfill(order.id)}
          style={[
            styles.primaryBtn,
            {
              backgroundColor: canFulfill && !busy ? theme.primary : theme.muted,
              opacity: canFulfill && !busy ? 1 : 0.6,
            },
          ]}
        >
          <Text
            style={[
              styles.primaryBtnText,
              { color: canFulfill && !busy ? theme.primaryForeground : theme.mutedForeground },
            ]}
          >
            Fulfill
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!canCancel || busy}
          onPress={() => onCancel(order.id)}
          style={[
            styles.secondaryBtn,
            {
              borderColor: theme.border,
              opacity: canCancel && !busy ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.foreground }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const { orders, summary, isLoading, isFetching, refetch, error } = useOrders();
  const fulfill = useFulfillOrder();
  const cancel = useCancelOrder();

  const busyId = fulfill.isPending
    ? (fulfill.variables as string | undefined)
    : cancel.isPending
      ? (cancel.variables as string | undefined)
      : undefined;

  const handleFulfill = (orderId: string) => {
    Alert.alert(
      "Mark order as fulfilled?",
      `This moves order ${orderId} from PAID to FULFILLED.`,
      [
        { text: "Back", style: "cancel" },
        {
          text: "Confirm Fulfill",
          onPress: () =>
            fulfill.mutate(orderId, {
              onError: (err: any) =>
                Alert.alert("Failed to fulfill order", err?.message || "Please try again."),
            }),
        },
      ],
    );
  };

  const handleCancel = (orderId: string) => {
    Alert.alert(
      "Cancel this order?",
      `This marks order ${orderId} as CANCELLED and cannot be undone from this screen.`,
      [
        { text: "Back", style: "cancel" },
        {
          text: "Confirm Cancel",
          style: "destructive",
          onPress: () =>
            cancel.mutate(orderId, {
              onError: (err: any) =>
                Alert.alert("Failed to cancel order", err?.message || "Please try again."),
            }),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          style={[styles.backBtn, { backgroundColor: theme.muted }]}
          accessibilityLabel="Back"
        >
          <IconSymbol size={18} name="chevron.left" color={theme.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <IconSymbol size={18} name="bell.fill" color={theme.primary} />
            <Text style={[styles.headerTitle, { color: theme.foreground }]}>Orders</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>
            Payment lifecycle & fulfillment
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => refetch()}
          style={[styles.backBtn, { backgroundColor: theme.muted }]}
          accessibilityLabel="Refresh"
        >
          {isFetching ? (
            <ActivityIndicator size="small" color={theme.foreground} />
          ) : (
            <IconSymbol size={18} name="arrow.clockwise" color={theme.foreground} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={theme.foreground}
          />
        }
      >
        {/* Status Summary Grid */}
        <View style={styles.summaryGrid}>
          {STATUS_ORDER.map((status) => {
            const colors = getStatusColors(status, theme);
            return (
              <View
                key={status}
                style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.summaryDot, { backgroundColor: colors.fg }]} />
                <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>{status}</Text>
                <Text style={[styles.summaryValue, { color: theme.foreground }]}>
                  {summary[status]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Recent Orders</Text>
          <Text style={[styles.sectionCount, { color: theme.mutedForeground }]}>
            {orders.length} total
          </Text>
        </View>

        {/* Orders List */}
        {isLoading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="small" color={theme.foreground} />
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyWrap}>
            <IconSymbol size={28} name="exclamationmark.triangle.fill" color={theme.destructive} />
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Couldn&apos;t load orders. Pull to refresh.
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <IconSymbol size={28} name="tray" color={theme.mutedForeground} />
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>No orders found.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                theme={theme}
                onFulfill={handleFulfill}
                onCancel={handleCancel}
                busy={busyId === order.id}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: "47%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  orderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: {
    fontSize: 13,
    fontWeight: "600",
  },
  orderRef: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  orderBodyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  orderValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  orderSubValue: {
    fontSize: 11,
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  orderActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
  },
});
