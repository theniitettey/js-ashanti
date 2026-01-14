import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import Divider from "@/components/ui/divider";
import { SFSymbol } from "expo-symbols";

const Typography = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

interface SalesCardProps {
  iconName: SFSymbol;
  iconColor: string;
  iconBgColor: string;
  title: string;
  amount: string;
}
const SalesCard = ({
  iconName,
  iconColor,
  iconBgColor,
  title,
  amount,
}: SalesCardProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const cardBg = theme.cardBg;
  const border = colorScheme === "dark" ? "#222" : "#d0d0d0";

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "flex-start",
        padding: 16,
        gap: 12,
        width: "48%",
        backgroundColor: cardBg,
        borderRadius: 16,
        borderColor: border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
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
          marginRight: 12,
        }}
      >
        <IconSymbol size={20} name={iconName} color={iconColor} />
      </View>
      <View style={{ marginTop: 8 }}>
        <Text style={{ fontSize: Typography.sm, color: theme.icon }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: Typography.xl,
            fontWeight: "700",
            color: theme.text,
          }}
        >
          {amount}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          height: 8,
          backgroundColor: "#e0e0e0",
          borderRadius: 4,
          marginLeft: 16,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: "70%",
            height: "100%",
            backgroundColor: iconColor,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
};

interface AIInsightsCardProps {
  text: string;
}
const AIInsightsCard = ({ text }: AIInsightsCardProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: theme.cardBg,
      }}
    >
      <IconSymbol size={8} name="circle.fill" color={theme.tint} />
      <Text style={{ color: theme.text, fontSize: Typography.sm }}>{text}</Text>
    </View>
  );
};

interface InventoryItemCardProps {
  itemName: string;
  sku: string;
  imageUrl: string;
  stockLevel: number;
  stockStatus: "critical" | "low-stock" | "healthy";
}

const InventoryItemCard = ({
  itemName,
  sku,
  imageUrl,
  stockLevel,
  stockStatus,
}: InventoryItemCardProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.cardBg,
        justifyContent: "space-between",
        padding: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 44, height: 44, borderRadius: 8 }}
        />
        <View>
          <Text
            style={{
              fontSize: Typography.md,
              fontWeight: "700",
              color: theme.text,
            }}
          >
            {itemName}
          </Text>
          <Text style={{ fontSize: Typography.xs, color: theme.icon }}>
            SKU: {sku}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <View
          style={{
            backgroundColor:
              stockStatus === "healthy"
                ? "green"
                : stockStatus === "low-stock"
                ? "orange"
                : "red",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color:
                stockStatus === "healthy"
                  ? "#0b6b3a"
                  : stockStatus === "low-stock"
                  ? "#8a6d02"
                  : "#a71d1d",
            }}
          >
            {stockStatus === "healthy"
              ? "HEALTHY"
              : stockStatus === "low-stock"
              ? "LOW STOCK"
              : "CRITICAL"}
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.text }}>
          {stockLevel}
        </Text>
      </View>
    </View>
  );
};

const INVENTORY_ITEMS: InventoryItemCardProps[] = [
  {
    itemName: "Gaming Mouse Pro",
    sku: "GM-PR-001",
    imageUrl: "https://via.placeholder.com/50x50.png?text=Mouse",
    stockLevel: 3,
    stockStatus: "critical",
  },
  {
    itemName: "Mechanical Keyboard X",
    sku: "MK-X-002",
    imageUrl: "https://via.placeholder.com/50x50.png?text=Keyboard",
    stockLevel: 12,
    stockStatus: "low-stock",
  },
  {
    itemName: "4K Ultra HD Monitor",
    sku: "HDM-24-003",
    imageUrl: "https://via.placeholder.com/50x50.png?text=Monitor",
    stockLevel: 45,
    stockStatus: "healthy",
  },
];

const AI_INSIGHTS = [
  "Sales are up 15% compared to last week.",
  "New user sign-ups increased by 20%.",
  "Top-selling product: Wireless Headphones.",
  "Peak traffic hours: 6 PM - 9 PM.",
];

interface RevenueByCategoryData {
  category: string;
  revenue: number;
}

const REVENUE_BY_CATEGORY_DATA: RevenueByCategoryData[] = [
  { category: "Electronics", revenue: 12000 },
  { category: "Apparel", revenue: 8000 },
  { category: "Home & Garden", revenue: 6000 },
  { category: "Sports", revenue: 4000 },
];

const RevenueByCategoryChart = ({
  data,
}: {
  data: RevenueByCategoryData[];
}) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 200,
        padding: 16,
        borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
        borderWidth: 1,
        backgroundColor: theme.cardBg,
        borderRadius: 16,
      }}
    >
      {data.map((item, index) => {
        const barHeight = (item.revenue / totalRevenue) * 150; // Max height 150
        return (
          <View
            key={index}
            style={{ alignItems: "center", width: 60, marginHorizontal: 8 }}
          >
            <View
              style={{
                width: 40,
                height: barHeight,
                backgroundColor: "#4a90e2",
                borderRadius: 8,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            ></View>
            <Text style={{ marginTop: 8, fontSize: 12, color: theme.text }}>
              {item.category.slice(0, 4)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor:
          colorScheme === "dark" ? "transparent" : theme.background,
      }}
      contentContainerStyle={{ gap: 20 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingHorizontal: 8,
        }}
      >
        <IconSymbol
          style={{
            padding: 6,
            borderRadius: 8,
            backgroundColor: "#0c0e1f",
          }}
          size={24}
          name="chart.bar.fill"
          color={"#6366f1"}
        />
        <View>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "700",
              color: theme.text,
            }}
          >
            Admin Dashboard
          </Text>
          <Text style={{ fontSize: Typography.sm, color: theme.icon }}>
            Store Overview
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View>
            <IconSymbol size={22} name="bell.fill" color={theme.icon} />
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "red",
              }}
            />
          </View>

          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/75.jpg",
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              marginLeft: 16,
            }}
          />
        </View>
      </View>
      <Divider />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.text }}>
          Live Traffic
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderColor: "green",
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 16,
          }}
        >
          <IconSymbol color={"green"} name="circle.fill" size={12} />
          <Text style={{ color: "green" }}>Live</Text>
        </View>
      </View>
      <View
        style={{
          padding: 16,
          borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
          borderWidth: 1,
          borderRadius: 16,
          backgroundColor: theme.cardBg,
        }}
      >
        <Text style={{ fontSize: 16, color: theme.tint, marginBottom: 8 }}>
          Current Visitors
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Text
              style={{
                fontSize: Typography.xxl,
                fontWeight: "700",
                color: theme.text,
              }}
            >
              1,245
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <IconSymbol color={"green"} name="arrow.up.right" />
              <Text style={{ color: "green" }}>+12%</Text>
            </View>
          </View>
          <IconSymbol color={"#5155c5"} name="chart.bar.fill" size={50} />
        </View>
        <Divider />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 16, color: theme.tint, marginBottom: 8 }}>
              Active Sessions
            </Text>
            <View>
              <Text
                style={{
                  fontSize: Typography.xxl,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                845
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 16, color: theme.tint, marginBottom: 8 }}>
              Page Views/Min
            </Text>
            <View>
              <Text
                style={{
                  fontSize: Typography.xxl,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                3.2k
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>
        Sales Overview
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <SalesCard
          iconName="dollarsign.circle.fill"
          iconColor="#5458cd"
          iconBgColor="#14182d"
          title="Total Revenue"
          amount="$24,300"
        />
        <SalesCard
          iconName="creditcard.fill"
          iconColor="#ff6900"
          iconBgColor="#231815"
          title="Online Sales"
          amount="$15,200"
        />
      </View>

      <View
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 8,
          paddingVertical: 20,
          paddingHorizontal: 16,
          borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
          borderWidth: 1,
          borderRadius: 16,
          backgroundColor: theme.cardBg,
        }}
      >
        <View
          style={{
            backgroundColor: "#6366f1",
            padding: 8,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            width: 120,
            justifyContent: "center",
          }}
        >
          <IconSymbol size={16} name="star.slash.fill" color={theme.text} />
          <Text style={{ color: theme.text }}>AI Insights</Text>
        </View>
        {AI_INSIGHTS.map((insight, index) => (
          <AIInsightsCard key={index} text={insight} />
        ))}

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 16,
            justifyContent: "center",
            gap: 8,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#1e293b",
          }}
        >
          <IconSymbol size={20} name="bubble.left.fill" color={theme.text} />
          <Text style={{ color: theme.text }}>Ask AI Assistant</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>
          Inventory Status
        </Text>
        <TouchableOpacity>
          <Text style={{ color: theme.tint }}>View All</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 0,
          padding: 12,
          borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
          borderWidth: 1,
          borderRadius: 16,
          backgroundColor: theme.cardBg,
        }}
      >
        {INVENTORY_ITEMS.map((item, index) => (
          <InventoryItemCard key={index} {...item} />
        ))}
      </View>
      <Text
        style={{
          fontSize: Typography.md,
          fontWeight: "600",
          color: theme.text,
        }}
      >
        Revenue By Category
      </Text>
      <RevenueByCategoryChart data={REVENUE_BY_CATEGORY_DATA} />
    </ScrollView>
  );
}
