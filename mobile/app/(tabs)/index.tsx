import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import Divider from "@/components/ui/divider";
import { SFSymbol } from "expo-symbols";
import { useState, useEffect, useRef } from "react";
import { API_ENDPOINTS, apiRequestWithAuth } from "@/lib/api";
import { aiInsightsService, AIInsight } from "@/lib/ai-insights";
import { useAuth } from "@/contexts/AuthContext";
import { AppColors } from "@/constants/theme";

// Live indicator pulsing animation component
const LiveIndicator = ({ connected }: { connected: boolean }) => {
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [opacity, connected]);

  return (
    <Animated.View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: connected ? "#00FF00" : "#FF0000",
        opacity: connected ? opacity : 1,
      }}
    />
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  percentage?: string;
  icon: SFSymbol;
  iconColor: string;
  iconBgColor: string;
  progressColor: string;
}

const MetricCard = ({
  label,
  value,
  percentage,
  icon,
  iconColor,
  iconBgColor,
  progressColor,
}: MetricCardProps) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: AppColors.surface,
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: AppColors.border,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconBgColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconSymbol size={22} name={icon} color={iconColor} />
      </View>
      <View>
        <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginBottom: 4 }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: AppColors.text,
            marginBottom: 8,
          }}
        >
          {value}
        </Text>
        {percentage && (
          <Text style={{ fontSize: 12, color: AppColors.success, fontWeight: "600" }}>
            {percentage}
          </Text>
        )}
      </View>
      <View
        style={{
          width: "100%",
          height: 6,
          backgroundColor: AppColors.border,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: "70%",
            height: "100%",
            backgroundColor: progressColor,
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
};

interface InventoryProductProps {
  name: string;
  sku: string;
  status: "CRITICAL" | "LOW STOCK" | "HEALTHY";
  stockCount: number;
}

const InventoryProductCard = ({
  name,
  sku,
  status,
  stockCount,
}: InventoryProductProps) => {
  const statusColor =
    status === "CRITICAL"
      ? "#FF3B30"
      : status === "LOW STOCK"
        ? "#FFB800"
        : AppColors.success;
  const statusBgColor =
    status === "CRITICAL"
      ? "#2D0B0A"
      : status === "LOW STOCK"
        ? "#332A0F"
        : "#0D2818";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.surfaceElevated,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            backgroundColor: AppColors.surfaceElevated,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: "#666666" }}>📦</Text>
        </View>
        <View>
          <Text style={{ fontSize: 14, fontWeight: "600", color: AppColors.text }}>
            {name}
          </Text>
          <Text style={{ fontSize: 12, color: AppColors.textSecondary, marginTop: 2 }}>
            SKU: {sku}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            backgroundColor: statusBgColor,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
            minWidth: 80,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 11, color: statusColor, fontWeight: "600" }}>
            {status}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: AppColors.text,
            minWidth: 30,
            textAlign: "right",
          }}
        >
          {stockCount}
        </Text>
      </View>
    </View>
  );
};

const BarChartBar = ({ height, label }: { height: number; label: string }) => (
  <View style={{ alignItems: "center", gap: 8 }}>
    <View
      style={{
        width: 32,
        height: height,
        backgroundColor: AppColors.primary,
        borderRadius: 6,
      }}
    />
    <Text style={{ fontSize: 11, color: AppColors.textSecondary }}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const metricsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastSuccessfulFetch = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchDashboardData();
    fetchAIInsights();

    // Poll at a reasonable cadence to reduce UI jank and backend load.
    metricsIntervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    // Check connection status based on successful API fetches
    const connectionCheckInterval = setInterval(() => {
      const timeSinceLastFetch = Date.now() - lastSuccessfulFetch.current;
      // Consider connected if we've had a successful fetch in the last 5 seconds
      setWsConnected(timeSinceLastFetch < 5000);
    }, 1000);

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      clearInterval(connectionCheckInterval);
    };
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const data = await apiRequestWithAuth(
        API_ENDPOINTS.MOBILE.ANALYTICS.DASHBOARD,
      );
      setDashboardData(data);
      setDashboardError(null);
      // Update last successful fetch timestamp
      lastSuccessfulFetch.current = Date.now();
    } catch (err: any) {
      console.error("Failed to fetch dashboard:", err);
      const message =
        err?.message ||
        "Unable to load dashboard right now. Please check backend connection.";
      setDashboardError(message);
      // Set default data on error
      setDashboardData({
        metrics: {
          totalProducts: 248,
          lowStock: 18,
          outOfStock: 7,
          totalRevenue: 128000,
          currentVisitors: 1284,
          activeVisitors: 843,
          pageViewsPerMin: 3.2,
        },
        topProducts: [],
        revenueByCategory: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const response = await aiInsightsService.getInsights();
      setAIInsights(response.insights.slice(0, 3)); // Show top 3 insights
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      {/* Sticky Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: AppColors.white,
          borderBottomWidth: 1,
          borderBottomColor: AppColors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: "#FFEDD5",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconSymbol size={24} name="chart.bar.fill" color={AppColors.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: AppColors.text }}>
              Admin Dashboard
            </Text>
            <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 2 }}>
              Store Overview
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ position: "relative" }}>
            <IconSymbol size={22} name="bell.fill" color={AppColors.textSecondary} />
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: AppColors.error,
              }}
            />
          </View>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/75.jpg",
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: AppColors.background,
        }}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 100 }}
      >
        <View style={{ paddingHorizontal: 16, gap: 20 }}>
          {dashboardError ? (
            <View
              style={{
                backgroundColor: "#2D1616",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: AppColors.error,
                padding: 12,
              }}
            >
              <Text style={{ color: AppColors.error, fontSize: 13, marginBottom: 8 }}>
                {dashboardError}
              </Text>
              <TouchableOpacity
                onPress={fetchDashboardData}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: AppColors.primary,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: AppColors.white, fontWeight: "600", fontSize: 12 }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Live Traffic Section */}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: AppColors.text }}
              >
                Live Store Activity
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <LiveIndicator connected={wsConnected} />
                <Text
                  style={{
                    fontSize: 12,
                    color: wsConnected ? AppColors.success : AppColors.error,
                    fontWeight: "600",
                  }}
                >
                  {wsConnected ? "Live" : "Offline"}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: AppColors.surface,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginBottom: 8 }}>
                Current Visitors
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: AppColors.text,
                    }}
                  >
                    {loading
                      ? "-"
                      : dashboardData?.metrics?.currentVisitors?.toLocaleString() ||
                        "1,284"}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 6,
                    }}
                  >
                    <IconSymbol
                      size={12}
                      name="arrow.up.right"
                      color={AppColors.success}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        color: AppColors.success,
                        fontWeight: "600",
                      }}
                    >
                      +12%
                    </Text>
                  </View>
                </View>
                <IconSymbol size={48} name="chart.bar.fill" color={AppColors.primary} />
              </View>

              <Divider />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 16,
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: 13, color: AppColors.textSecondary, marginBottom: 6 }}
                  >
                    Active Sessions
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: AppColors.text,
                    }}
                  >
                    {loading
                      ? "-"
                      : dashboardData?.metrics?.activeVisitors?.toLocaleString() ||
                        "843"}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{ fontSize: 13, color: AppColors.textSecondary, marginBottom: 6 }}
                  >
                    Page Views/min
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: AppColors.text,
                    }}
                  >
                    {loading
                      ? "-"
                      : dashboardData?.metrics?.pageViewsPerMin || "3.2k"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sales Overview Section */}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: AppColors.text }}
              >
                Sales Overview
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: AppColors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: AppColors.text }}>Today</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <MetricCard
                label="Total Revenue"
                value="$4,298"
                percentage="+8.2% from yesterday"
                icon="dollarsign.circle.fill"
                iconColor={AppColors.primary}
                iconBgColor="#2A1A5E"
                progressColor={AppColors.primary}
              />
              <MetricCard
                label="Orders"
                value="156"
                percentage="+15.3% from yesterday"
                icon="bag.fill"
                iconColor="#FF9500"
                iconBgColor="#3A2A1A"
                progressColor="#FF9500"
              />
            </View>
          </View>

          {/* AI Insights Section */}
          <View
            style={{
              backgroundColor: AppColors.surface,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: AppColors.primary,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                width: "auto",
                alignSelf: "flex-start",
                marginBottom: 12,
              }}
            >
              <IconSymbol size={14} name="sparkles" color={AppColors.white} />
              <Text
                style={{ fontSize: 11, color: AppColors.white, fontWeight: "600" }}
              >
                AI INSIGHTS
              </Text>
            </View>

            <View style={{ gap: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: AppColors.primary,
                    marginTop: 6,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: AppColors.text,
                    flex: 1,
                    lineHeight: 18,
                  }}
                >
                  Traffic Spike Predicted around 2 PM based on historical
                  patterns. Consider scheduling a flash sale.
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: AppColors.primary,
                    marginTop: 6,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: AppColors.text,
                    flex: 1,
                    lineHeight: 18,
                  }}
                >
                  Restock Alert: Wireless Earbuds are trending up 200%. Current
                  stock will deplete in 4 hours.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: AppColors.surfaceElevated,
                borderWidth: 1,
                borderColor: AppColors.border,
                paddingVertical: 12,
                borderRadius: 10,
              }}
            >
              <IconSymbol size={18} name="bubble.left.fill" color={AppColors.text} />
              <Text
                style={{ fontSize: 14, color: AppColors.text, fontWeight: "600" }}
              >
                Ask AI Assistant
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inventory Status Section */}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: AppColors.text }}
              >
                Inventory Status
              </Text>
              <TouchableOpacity>
                <Text
                  style={{ fontSize: 13, color: AppColors.primary, fontWeight: "600" }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: AppColors.surface,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <InventoryProductCard
                name="Gaming Mouse Pro"
                sku="GM-9021"
                status="CRITICAL"
                stockCount={3}
              />
              <InventoryProductCard
                name="Mech Keyboard"
                sku="MK-8832"
                status="LOW STOCK"
                stockCount={12}
              />
              <InventoryProductCard
                name="4K Monitor"
                sku="MN-4000"
                status="HEALTHY"
                stockCount={45}
              />
            </View>
          </View>

          {/* Revenue by Category Section */}
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: AppColors.text,
                marginBottom: 12,
              }}
            >
              Revenue by Category
            </Text>
            <View
              style={{
                backgroundColor: AppColors.surface,
                borderRadius: 16,
                padding: 16,
                minHeight: 200,
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "flex-end",
                  height: 120,
                }}
              >
                <BarChartBar height={95} label="Elec" />
                <BarChartBar height={70} label="Cloth" />
                <BarChartBar height={55} label="Home" />
                <BarChartBar height={45} label="Acc" />
                <BarChartBar height={35} label="Sport" />
              </View>
            </View>
          </View>

          {/* AI Insights Section */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <IconSymbol size={18} name="sparkles" color="#FFD60A" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: AppColors.text,
                  }}
                >
                  AI Insights
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: AppColors.primary }}>Live</Text>
            </View>
            <View style={{ gap: 12 }}>
              {aiInsights.length > 0 ? (
                aiInsights.map((insight) => (
                  <View
                    key={insight.id}
                    style={{
                      backgroundColor: AppColors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderLeftWidth: 4,
                      borderLeftColor:
                        insight.type === "trend"
                          ? "#00FF00"
                          : insight.type === "anomaly"
                            ? "#FF3B30"
                            : insight.type === "recommendation"
                              ? "#FFD60A"
                              : AppColors.primary,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: AppColors.text,
                          flex: 1,
                        }}
                      >
                        {insight.title}
                      </Text>
                      <View
                        style={{
                          backgroundColor:
                            insight.confidence > 0.9
                              ? "#001F3F"
                              : insight.confidence > 0.8
                                ? "#0B3D2C"
                                : "#3D2B0B",
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4,
                          marginLeft: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color:
                              insight.confidence > 0.9
                                ? "#6BB6FF"
                                : insight.confidence > 0.8
                                  ? "#64D17A"
                                  : "#FFB546",
                          }}
                        >
                          {Math.round(insight.confidence * 100)}%
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        marginBottom: 8,
                      }}
                    >
                      {insight.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        }}
                      >
                        {new Date(insight.timestamp).toLocaleTimeString()}
                      </Text>
                      {insight.actionable && (
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            backgroundColor: AppColors.primary,
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "600",
                              color: AppColors.white,
                            }}
                          >
                            Action
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View
                  style={{
                    backgroundColor: AppColors.surface,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 80,
                  }}
                >
                  <Text style={{ fontSize: 13, color: AppColors.textSecondary }}>
                    Loading insights...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
