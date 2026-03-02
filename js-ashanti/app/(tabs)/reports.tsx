import { Colors } from "@/constants/theme";
import Typography from "@/constants/typography";
import {
  View,
  ScrollView,
  Text,
  useColorScheme,
  Button,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import { SFSymbol } from "expo-symbols";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { apiRequestWithAuth, API_ENDPOINTS } from "@/lib/api";

interface ReportItemCardProps {
  icon: SFSymbol;
  iconColor: string;
  iconBgColor: string;
  title: string;
  amount: string;
  percentage: string;
}

const ReportItemCard = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  amount,
  percentage,
}: ReportItemCardProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: theme.cardBg,
        padding: 16,
        borderRadius: 16,
        width: "48%",
        gap: 16,
        borderWidth: 1,
        borderColor: "#222222",
      }}
    >
      <IconSymbol
        name={icon}
        size={24}
        color={iconColor}
        style={{ backgroundColor: iconBgColor, padding: 8, borderRadius: 8 }}
      />
      <View style={{ flexDirection: "column", gap: 4, alignItems: "center" }}>
        <Text
          style={{
            fontSize: Typography.md,
            fontWeight: "500",
            marginTop: 8,
            color: theme.tint,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: theme.text,
            fontSize: Typography.lg,
            fontWeight: "600",
          }}
        >
          {amount}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <IconSymbol
          name={percentage.startsWith("+") ? "arrow.up" : "arrow.down"}
          size={12}
          color={percentage.startsWith("+") ? "green" : "red"}
        />
        <Text style={{ color: percentage.startsWith("+") ? "green" : "red" }}>
          {percentage}
        </Text>
      </View>
    </View>
  );
};

const SALES_DATA: ReportItemCardProps[] = [
  {
    icon: "dollarsign.circle.fill",
    iconColor: "#3B82F6",
    iconBgColor: "#071020",
    title: "Total Revenue",
    amount: "$84,249",
    percentage: "+12.5%",
  },
  {
    icon: "bag.fill",
    iconColor: "#F59E0B",
    iconBgColor: "#1a1208",
    title: "Total Orders",
    amount: "2,847",
    percentage: "+45.3%",
  },
  {
    icon: "person.fill",
    iconColor: "#3B82F6",
    iconBgColor: "#071020",
    title: "New Customers",
    amount: "1,249",
    percentage: "+44.1%",
  },
  {
    icon: "chart.bar.fill",
    iconColor: "#6B5FED",
    iconBgColor: "#100b1a",
    title: "Conversion Rate",
    amount: "3.8%",
    percentage: "-5.1%",
  },
];

interface SalesDataPoint {
  label: string;
  sales: number;
}
interface SalesData {
  month?: SalesDataPoint[];
  week?: SalesDataPoint[];
}
interface SalesPerformanceChartProps {
  data: SalesData;
  timeframe: "week" | "month";
}

const WEEKLY_CHART_DATA: SalesDataPoint[] = [
  { label: "Mon", sales: 4000 },
  { label: "Tue", sales: 3000 },
  { label: "Wed", sales: 2000 },
  { label: "Thu", sales: 2780 },
  { label: "Fri", sales: 1890 },
  { label: "Sat", sales: 2390 },
  { label: "Sun", sales: 3490 },
];

const MONTHLY_CHART_DATA: SalesDataPoint[] = [
  { label: "Jan", sales: 8000 },
  { label: "Feb", sales: 9200 },
  { label: "Mar", sales: 7500 },
  { label: "Apr", sales: 10200 },
  { label: "May", sales: 9800 },
  { label: "Jun", sales: 11500 },
  { label: "Jul", sales: 13000 },
  { label: "Aug", sales: 12500 },
  { label: "Sep", sales: 10800 },
  { label: "Oct", sales: 11200 },
  { label: "Nov", sales: 14000 },
  { label: "Dec", sales: 15500 },
];

const SALES_PERFORMANCE_DATA: SalesData = {
  week: WEEKLY_CHART_DATA,
  month: MONTHLY_CHART_DATA,
};

const SalesPerformanceChart = ({
  data,
  timeframe,
}: SalesPerformanceChartProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const chartData =
    timeframe === "week"
      ? (data.week ?? WEEKLY_CHART_DATA)
      : (data.month ?? MONTHLY_CHART_DATA);
  const maxSales = Math.max(...chartData.map((d) => d.sales));
  const minSales = Math.min(...chartData.map((d) => d.sales));
  const avgOrder = "$29.00"; // spec value
  const peak = timeframe === "week" ? "Friday" : "November";
  const growth = "+9.1%";

  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
        overflow: "hidden",
        padding: 12,
      }}
    >
      {/* Placeholder Line Chart Area */}
      <View
        style={{
          height: 180,
          borderRadius: 12,
          backgroundColor: colorScheme === "dark" ? "#0F1419" : "#f4f6fb",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.tint }}>Chart Placeholder</Text>
      </View>

      {/* Bottom Metrics Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <View>
          <Text style={{ color: theme.tint, fontSize: Typography.xs }}>
            Min
          </Text>
          <Text style={{ color: theme.text, fontSize: Typography.md }}>
            ${minSales}
          </Text>
        </View>
        <View>
          <Text style={{ color: theme.tint, fontSize: Typography.xs }}>
            Max
          </Text>
          <Text style={{ color: theme.text, fontSize: Typography.md }}>
            ${maxSales}
          </Text>
        </View>
        <View>
          <Text style={{ color: theme.tint, fontSize: Typography.xs }}>
            Avg Order
          </Text>
          <Text style={{ color: theme.text, fontSize: Typography.md }}>
            {avgOrder}
          </Text>
        </View>
        <View>
          <Text style={{ color: theme.tint, fontSize: Typography.xs }}>
            Peak Day
          </Text>
          <Text style={{ color: theme.text, fontSize: Typography.md }}>
            {peak}
          </Text>
        </View>
        <View>
          <Text style={{ color: theme.tint, fontSize: Typography.xs }}>
            Growth
          </Text>
          <Text style={{ color: "#10B981", fontSize: Typography.md }}>
            {growth}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface ProductData {
  name: string;
  imageUrl: string;
  unitsSold: number;
  revenue: string;
}

const TOP_PRODUCTS_DATA: ProductData[] = [
  {
    name: "Wireless Earbud",
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 847,
    revenue: "$126,450",
  },
  {
    name: "Smart Watch M1",
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 634,
    revenue: "$19,020",
  },
  {
    name: "Gaming Keyboard",
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 621,
    revenue: "$18,630",
  },
  {
    name: "USB-C Hub",
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 412,
    revenue: "$12,360",
  },
];

interface TopProductTableProps {
  data: ProductData[];
}

const TopProductsTable = ({ data }: TopProductTableProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
        overflow: "hidden",
      }}
    >
      {/* Header Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            color: theme.tint,
            fontSize: Typography.sm,
            fontWeight: "600",
            flex: 1,
          }}
        >
          Product
        </Text>
        <Text
          style={{
            color: theme.tint,
            fontSize: Typography.sm,
            fontWeight: "600",
            flex: 1,
          }}
        >
          Sales
        </Text>
        <Text
          style={{
            color: theme.tint,
            fontSize: Typography.sm,
            fontWeight: "600",
            flex: 1,
          }}
        >
          Revenue
        </Text>
      </View>

      {/* Data Rows */}
      {data.map((item, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === "dark" ? "#222" : "#e5e5e5",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flex: 1,
            }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 40, height: 40, borderRadius: 8 }}
            />
            <Text style={{ color: theme.text }}>{item.name}</Text>
          </View>
          <Text style={{ color: theme.text, flex: 1, textAlign: "center" }}>
            {item.unitsSold}
          </Text>
          <Text
            style={{
              color: "#6B5FED",
              flex: 1,
              textAlign: "right",
              fontWeight: "600",
            }}
          >
            {item.revenue}
          </Text>
        </View>
      ))}
    </View>
  );
};

interface ConversionFunnelData {
  dataType: string;
  value: number;
}

const CONVERSION_DATA: ConversionFunnelData[] = [
  { dataType: "Website Visits", value: 45820 },
  { dataType: "Product Views", value: 28340 },
  { dataType: "Add to Cart", value: 12470 },
  { dataType: "Checkout Started", value: 5840 },
  { dataType: "Orders Completed", value: 2847 },
];

interface ConversionFunnelProps {
  conversionData: ConversionFunnelData[];
}

const ConversionFunnel = ({ conversionData }: ConversionFunnelProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#222222",
        overflow: "hidden",
      }}
    >
      {conversionData.map((item, index) => (
        <View
          key={index}
          style={{
            flexDirection: "column",
            gap: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: Typography.sm,
                flex: 1,
              }}
            >
              {item.dataType}
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: Typography.sm,
                flex: 1,
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              {item.value}
            </Text>
          </View>
          <View
            style={{
              height: 36,
              backgroundColor: colorScheme === "dark" ? "#333" : "#e5e5e5",
              borderRadius: 10,
              overflow: "hidden",
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${(item.value / conversionData[0].value) * 100}%`,
                backgroundColor:
                  item.dataType === "Orders Completed" ? "#10B981" : "#6B5FED",
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

interface DeviceConversion {
  deviceType: string;
  rate: number;
}
interface CustomerAnalyticsData {
  avgSessionDuration: string;
  bounceRate: string;
  deviceConversion: DeviceConversion[];
}

const CUSTOMER_ANALYTICS_DATA: CustomerAnalyticsData = {
  avgSessionDuration: "4m 32s",
  bounceRate: "28.4%",
  deviceConversion: [
    { deviceType: "Mobile", rate: 68 },
    { deviceType: "Desktop", rate: 24 },
    { deviceType: "Tablet", rate: 8 },
  ],
};

interface CustomerAnalyticsProps {
  analyticsData: CustomerAnalyticsData;
}
const CustomerAnalytics = ({ analyticsData }: CustomerAnalyticsProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#222222",
        padding: 16,
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            backgroundColor: "#141c29",
            padding: 12,
            width: "48%",
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              color: theme.tint,
              fontSize: Typography.sm,
            }}
          >
            Avg. Session
          </Text>
          <Text
            style={{
              color: theme.text,
              fontSize: Typography.lg,
              fontWeight: "600",
              marginTop: 4,
            }}
          >
            {analyticsData.avgSessionDuration}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            backgroundColor: "#141c29",
            padding: 12,
            width: "48%",
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              color: theme.tint,
              fontSize: Typography.sm,
            }}
          >
            Bounce Rate
          </Text>
          <Text
            style={{
              color: theme.text,
              fontSize: Typography.lg,
              fontWeight: "600",
              marginTop: 4,
            }}
          >
            {analyticsData.bounceRate}
          </Text>
        </View>
      </View>
      <View>
        <Text
          style={{
            color: theme.tint,
            fontSize: Typography.sm,
            marginBottom: 8,
          }}
        >
          Device Conversion
        </Text>
        {analyticsData.deviceConversion.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "column",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text style={{ color: theme.text, fontSize: Typography.sm }}>
                {item.deviceType}
              </Text>
              <Text style={{ color: theme.text, fontSize: Typography.sm }}>
                {item.rate}%
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colorScheme === "dark" ? "#333" : "#e5e5e5",
                borderRadius: 4,
                overflow: "hidden",
                marginTop: 4,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${item.rate}%`,
                  backgroundColor:
                    item.deviceType === "Tablet" ? "#6B5FED" : "#3B82F6",
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

interface ExportHandlerProps {
  onExport: (format: "pdf" | "csv" | "xlsx") => void;
  format: "pdf" | "csv" | "xlsx";
  iconName: SFSymbol;
  iconColor: string;
  iconBgColor: string;
}

const EXPORT_OPTONS = [
  {
    format: "pdf" as const,
    iconName: "doc.richtext.fill" as SFSymbol,
    iconColor: "#fb2c36",
    iconBgColor: "#23121a",
  },
  {
    format: "csv" as const,
    iconName: "tablecells.fill" as SFSymbol,
    iconColor: "#00c950",
    iconBgColor: "#0a221d",
  },
  {
    format: "xlsx" as const,
    iconName: "tablecells.fill" as SFSymbol,
    iconColor: "#2b7fff",
    iconBgColor: "#0e1a2e",
  },
];

const ExportHandler = ({
  onExport,
  format,
  iconName,
  iconColor,
  iconBgColor,
}: ExportHandlerProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        backgroundColor: theme.cardBg,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        width: "30%",
        borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
      }}
    >
      <TouchableOpacity
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 16,
        }}
        onPress={() => onExport(format)}
      >
        <IconSymbol
          name={iconName}
          size={24}
          color={iconColor}
          style={{
            backgroundColor: iconBgColor,
            padding: 16,
            borderRadius: 16,
            marginBottom: 8,
            alignSelf: "center",
          }}
        />
        <Text style={{ color: theme.text, fontSize: Typography.md }}>
          {format === "pdf" ? "PDF" : format === "csv" ? "CSV" : "XLSX"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface ScheduleReportProps {
  reportsData: {
    title: string;
    schedule: string;
  }[];
}

const SCHEDULED_REPORTS_DATA: { title: string; schedule: string }[] = [
  { title: "Weekly Sales Summary", schedule: "Every Monday at 9:00 AM" },
  {
    title: "Monthly Performance",
    schedule: "Every month on the 1st at 10:00 AM",
  },
  { title: "Inventory Report", schedule: "Daily at 8:00 PM" },
];

const ScheduledReports = ({ reportsData }: ScheduleReportProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#222222",
        padding: 16,
        gap: 16,
      }}
    >
      {reportsData.map((item, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            paddingVertical: 12,
            gap: 12,
            width: "100%",
            alignItems: "center",
          }}
        >
          <IconSymbol
            name={
              index === 0 ? "calendar" : index === 1 ? "chart.bar" : "doc.text"
            }
            size={22}
            color={
              index === 0 ? "#6B5FED" : index === 1 ? "#F97316" : "#3B82F6"
            }
            style={{ backgroundColor: "#0e1724", padding: 12, borderRadius: 8 }}
          />
          <View style={{ flexDirection: "column", gap: 2 }}>
            <Text
              style={{
                color: theme.text,
                fontSize: Typography.md,
                fontWeight: "600",
              }}
            >
              {item.title}
            </Text>
            <Text style={{ color: theme.tint, fontSize: Typography.sm }}>
              {item.schedule}
            </Text>
          </View>
          <View style={{ marginLeft: "auto" }}>
            <TouchableOpacity style={{ padding: 6 }} onPress={() => {}}>
              <View style={{ width: 44, alignItems: "flex-end" }}>
                <Text style={{ color: "#10B981", fontWeight: "700" }}>On</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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

const AI_INSIGHTS = [
  "Sales are up 15% compared to last week.",
  "New user sign-ups increased by 20%.",
  "Top-selling product: Wireless Headphones.",
  "Peak traffic hours: 6 PM - 9 PM.",
];

interface ReportsHeaderProps {
  onRefresh: () => void;
  onBack: () => void;
  title: string;
  subtitle?: string;
  onDownload: () => void;
}

const ReportsHeader = ({
  onRefresh,
  onBack,
  title,
  subtitle,
  onDownload,
}: ReportsHeaderProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View
      style={{
        backgroundColor: "#000000",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
            <IconSymbol
              name="arrow.left"
              size={20}
              color={theme.text}
              style={{
                padding: 16,
                borderRadius: 8,
                backgroundColor: theme.cardBg,
              }}
            />
          </TouchableOpacity>
          <View>
            <Text
              style={{
                fontSize: Typography.lg,
                fontWeight: "700",
                color: theme.text,
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: Typography.sm,
                  color: theme.tint,
                  marginTop: 4,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity onPress={onRefresh}>
            <IconSymbol name="arrow.clockwise" size={24} color={theme.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDownload}>
            <IconSymbol
              name="arrow.down.circle.fill"
              size={24}
              color={theme.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
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
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function Reports() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedValue, setSelectedValue] = useState("income");
  const [showReportPicker, setShowReportPicker] = useState(false);
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const data = await apiRequestWithAuth(
        API_ENDPOINTS.MOBILE.ANALYTICS.REPORTS,
      );
      setReportsData(data);
    } catch (err: any) {
      // Fallback: show mock data
      setReportsData({
        metrics: {
          revenue: 84249,
          orders: 2847,
          customers: 1249,
          conversion: 3.8,
        },
        topProducts: [],
        conversionFunnel: [],
        customerAnalytics: {
          avgSession: 0,
          bounceRate: 0,
          devices: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
  };

  const showDaetePicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Sticky Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "#000000",
        }}
      >
        <ReportsHeader
          onBack={() => {}}
          onRefresh={() => {}}
          onDownload={() => {}}
          title="Reports"
          subtitle="Analytics & Insights"
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 140, paddingHorizontal: 16 }}
      >
        <Text
          style={{
            fontSize: Typography.lg,
            fontWeight: "semibold",
            color: theme.text,
          }}
        >
          Filters
        </Text>
        <View
          style={{
            flexDirection: "column",
            gap: 16,
            marginTop: 12,
            backgroundColor: theme.cardBg,
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: "#",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Text style={{ color: theme.tint, fontSize: Typography.sm }}>
                  Date Range
                </Text>
                <Button onPress={showDaetePicker} title="Select Date" />
                {showPicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    onChange={onChange}
                    display="default"
                  />
                )}
              </View>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Text style={{ color: theme.tint, fontSize: Typography.sm }}>
                  Report Type
                </Text>
                <TouchableOpacity
                  onPress={() => setShowReportPicker(!showReportPicker)}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: "#374151",
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: Typography.sm }}>
                    {selectedValue === "income"
                      ? "Income Report"
                      : selectedValue === "expenses"
                        ? "Expenses Report"
                        : "Profit & Loss Report"}
                  </Text>
                </TouchableOpacity>
                {showReportPicker && (
                  <View
                    style={{
                      position: "absolute",
                      top: 65,
                      left: 0,
                      right: 0,
                      backgroundColor: theme.cardBg,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#374151",
                      zIndex: 100,
                      shadowColor: "#000",
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    {[
                      { label: "Income Report", value: "income" },
                      { label: "Expenses Report", value: "expenses" },
                      { label: "Profit & Loss Report", value: "profit_loss" },
                    ].map((item, idx) => (
                      <TouchableOpacity
                        key={item.value}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          borderBottomWidth: idx < 2 ? 1 : 0,
                          borderBottomColor: "#374151",
                        }}
                        onPress={() => {
                          setSelectedValue(item.value);
                          setShowReportPicker(false);
                        }}
                      >
                        <Text
                          style={{ color: theme.text, fontSize: Typography.sm }}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.tabIconSelected,
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
              onPress={() => {}}
            >
              <Text style={{ color: theme.text, fontSize: Typography.sm }}>
                Apply Filters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#1e293b",
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
              onPress={() => {}}
            >
              <Text style={{ color: theme.text, fontSize: Typography.sm }}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "semibold",
              color: theme.text,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Key Metrics
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "space-between",
            }}
          >
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: "48%",
                      padding: 12,
                      backgroundColor: "#1A1F2E",
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: "#888" }}>Loading...</Text>
                  </View>
                ))
              : (reportsData?.metrics
                  ? [
                      {
                        icon: "dollarsign.circle.fill" as SFSymbol,
                        iconColor: "#3B82F6",
                        iconBgColor: "#071020",
                        title: "Total Revenue",
                        amount:
                          typeof reportsData.metrics.revenue === "object"
                            ? reportsData.metrics.revenue.value || "$84,249"
                            : `$${Number(reportsData.metrics.revenue || 84249).toLocaleString()}`,
                        percentage:
                          typeof reportsData.metrics.revenue === "object"
                            ? reportsData.metrics.revenue.percentage || "+12.5%"
                            : "+12.5%",
                      },
                      {
                        icon: "cart.fill" as SFSymbol,
                        iconColor: "#F59E0B",
                        iconBgColor: "#1a1208",
                        title: "Total Orders",
                        amount:
                          typeof reportsData.metrics.orders === "object"
                            ? reportsData.metrics.orders.value || "2,847"
                            : `${Number(reportsData.metrics.orders || 2847).toLocaleString()}`,
                        percentage:
                          typeof reportsData.metrics.orders === "object"
                            ? reportsData.metrics.orders.percentage || "+45.3%"
                            : "+45.3%",
                      },
                      {
                        icon: "person.fill" as SFSymbol,
                        iconColor: "#3B82F6",
                        iconBgColor: "#071020",
                        title: "New Customers",
                        amount:
                          typeof reportsData.metrics.customers === "object"
                            ? reportsData.metrics.customers.value || "1,249"
                            : `${Number(reportsData.metrics.customers || 1249).toLocaleString()}`,
                        percentage:
                          typeof reportsData.metrics.customers === "object"
                            ? reportsData.metrics.customers.percentage ||
                              "+44.1%"
                            : "+44.1%",
                      },
                      {
                        icon: "chart.bar.fill" as SFSymbol,
                        iconColor: "#6B5FED",
                        iconBgColor: "#100b1a",
                        title: "Conversion Rate",
                        amount:
                          typeof reportsData.metrics.conversion === "object"
                            ? reportsData.metrics.conversion.value || "3.8%"
                            : `${(typeof reportsData.metrics.conversion === "number" ? reportsData.metrics.conversion : 3.8).toFixed(1)}%`,
                        percentage:
                          typeof reportsData.metrics.conversion === "object"
                            ? reportsData.metrics.conversion.percentage ||
                              "-5.1%"
                            : "-5.1%",
                      },
                    ]
                  : SALES_DATA
                ).map((item, index) => (
                  <ReportItemCard key={index} {...item} />
                ))}
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: Typography.lg,
                fontWeight: "semibold",
                color: theme.text,
                marginTop: 24,
                marginBottom: 12,
              }}
            >
              Sales Performance
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor:
                    timeframe === "week" ? theme.tabIconSelected : theme.cardBg,
                  borderWidth: 1,
                  borderColor: colorScheme === "dark" ? "#333" : "#e5e5e5",
                }}
                onPress={() => setTimeframe("week")}
              >
                <Text
                  style={{
                    fontSize: Typography.xs,
                    color: timeframe === "week" ? "white" : theme.tint,
                    fontWeight: "500",
                  }}
                >
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor:
                    timeframe === "month"
                      ? theme.tabIconSelected
                      : theme.cardBg,
                  borderWidth: 1,
                  borderColor: colorScheme === "dark" ? "#333" : "#e5e5e5",
                }}
                onPress={() => setTimeframe("month")}
              >
                <Text
                  style={{
                    fontSize: Typography.xs,
                    color: timeframe === "month" ? "white" : theme.tint,
                    fontWeight: "500",
                  }}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <SalesPerformanceChart
            data={SALES_PERFORMANCE_DATA}
            timeframe={timeframe}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "semibold",
              color: theme.text,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Top Products
          </Text>
          <TopProductsTable data={TOP_PRODUCTS_DATA} />
        </View>
        <View>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "semibold",
              color: theme.text,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Conversion Funnel
          </Text>
          <ConversionFunnel conversionData={CONVERSION_DATA} />
        </View>
        <View>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "semibold",
              color: theme.text,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Customer Analytics
          </Text>
          <CustomerAnalytics analyticsData={CUSTOMER_ANALYTICS_DATA} />
        </View>
        <View>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "semibold",
              color: theme.text,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Export Reports
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            {EXPORT_OPTONS.map((option, index) => (
              <ExportHandler
                key={index}
                onExport={(format) => {
                  // Handle export logic here
                }}
                format={option.format}
                iconName={option.iconName}
                iconColor={option.iconColor}
                iconBgColor={option.iconBgColor}
              />
            ))}
          </View>
        </View>
        <View>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "semibold",
              color: theme.text,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Scheduled Reports
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <ScheduledReports reportsData={SCHEDULED_REPORTS_DATA} />
          </View>
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
            marginTop: 24,
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
            <Text style={{ color: theme.text }}>Get More Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Key Findings & Recommendations */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: Typography.lg,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Key Findings & Recommendations
          </Text>
          <View
            style={{
              backgroundColor: theme.cardBg,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#222",
            }}
          >
            <View style={{ gap: 8 }}>
              <Text style={{ color: theme.tint }}>
                • Revenue Growth: Weekly revenue increased by 12.5% compared to
                last period.
              </Text>
              <Text style={{ color: theme.tint }}>
                • High Abandonment: 73% cart abandonment observed at
                checkout—optimize funnel.
              </Text>
              <Text style={{ color: theme.tint }}>
                • Mobile Optimization: 68% of traffic is mobile; improve mobile
                checkout flow.
              </Text>
              <Text style={{ color: theme.tint }}>
                • Product Synergy: Wireless Earbuds frequently purchased with
                USB‑C Hubs—bundle opportunity.
              </Text>
            </View>
            <TouchableOpacity
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#263244",
                backgroundColor: "#0F1724",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <IconSymbol name="sparkles" size={18} color={theme.text} />
              <Text style={{ color: theme.text }}>Get More Insights</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
