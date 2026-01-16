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
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { SFSymbol } from "expo-symbols";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";

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
    iconColor: "#6366f1",
    iconBgColor: "#14182d",
    title: "Total Revenue",
    amount: "$25,000",
    percentage: "+5.4%",
  },
  {
    icon: "cart.fill",
    iconColor: "#ff6900",
    iconBgColor: "#231815",
    title: "Total Orders",
    amount: "1,200",
    percentage: "+3.2%",
  },
  {
    icon: "person.2.fill",
    iconColor: "#2b7fff",
    iconBgColor: "#0e1a2e",
    title: "New Customers",
    amount: "350",
    percentage: "-1.2%",
  },
  {
    icon: "chart.bar.fill",
    iconColor: "#ad46ff",
    iconBgColor: "#1b152e",
    title: "Conversion Rate",
    amount: "150",
    percentage: "+4.8%",
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

interface PerformanceMetric {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
}

const getPerformanceMetrics = (
  timeframe: "week" | "month"
): PerformanceMetric[] => {
  const chartData =
    timeframe === "week" ? WEEKLY_CHART_DATA : MONTHLY_CHART_DATA;
  const peakItem = chartData.reduce((prev, current) =>
    current.sales > prev.sales ? current : prev
  );
  const peakLabel = timeframe === "week" ? "Peak Day" : "Peak Month";

  return [
    {
      label: "Avg Order",
      value: "$125.50",
      trend: "+2.5%",
      trendDirection: "up",
    },
    {
      label: peakLabel,
      value: peakItem.label,
      trend: "+15%",
      trendDirection: "up",
    },
    {
      label: "Growth Rate",
      value: "18.5%",
      trend: "+5.2%",
      trendDirection: "up",
    },
  ];
};

const PerformanceMetricColumn = ({ metric }: { metric: PerformanceMetric }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: Typography.sm, color: theme.tint }}>
        {metric.label}
      </Text>
      <View style={{ flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Text
          style={{
            fontSize: Typography.md,
            fontWeight: "600",
            color: theme.text,
          }}
        >
          {metric.value}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <IconSymbol
            name={metric.trendDirection === "up" ? "arrow.up" : "arrow.down"}
            size={12}
            color={metric.trendDirection === "up" ? "green" : "red"}
          />
          <Text
            style={{
              fontSize: Typography.xs,
              color: metric.trendDirection === "up" ? "green" : "red",
            }}
          >
            {metric.trend}
          </Text>
        </View>
      </View>
    </View>
  );
};

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
      ? data.week ?? WEEKLY_CHART_DATA
      : data.month ?? MONTHLY_CHART_DATA;

  const maxSales = Math.max(...chartData.map((d) => d.sales));
  const performanceMetrics = getPerformanceMetrics(timeframe);

  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colorScheme === "dark" ? "#222" : "#d0d0d0",
        overflow: "hidden",
      }}
    >
      {/* Chart Section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        {chartData.map((item, index) => {
          const barHeight = (item.sales / maxSales) * 150;
          return (
            <View
              key={index}
              style={{
                alignItems: "center",
                width: 48,
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: barHeight,
                  backgroundColor: "#4a90e2",
                  borderRadius: 6,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              />
              <Text style={{ marginTop: 8, fontSize: 11, color: theme.text }}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Metrics Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {performanceMetrics.map((metric, index) => (
          <PerformanceMetricColumn key={index} metric={metric} />
        ))}
      </View>
    </View>
  );
};

interface ProductData {
  imageUrl: string;
  unitsSold: number;
  revenue: string;
}

const TOP_PRODUCTS_DATA: ProductData[] = [
  {
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 150,
    revenue: "$3,000",
  },
  {
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 120,
    revenue: "$2,400",
  },
  {
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 100,
    revenue: "$2,000",
  },
  {
    imageUrl: "https://via.placeholder.com/40",
    unitsSold: 90,
    revenue: "$1,800",
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
            <Text style={{ color: theme.text }}>{`Product ${index + 1}`}</Text>
          </View>
          <Text style={{ color: theme.text, flex: 1 }}>{item.unitsSold}</Text>
          <Text style={{ color: theme.text, flex: 1 }}>{item.revenue}</Text>
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
  {
    dataType: "Website Visits",
    value: 45820,
  },
  {
    dataType: "Product Views",
    value: 32540,
  },
  {
    dataType: "Add to Cart",
    value: 12450,
  },
  {
    dataType: "Checkout Started",
    value: 8420,
  },
  {
    dataType: "Orders Completed",
    value: 5420,
  },
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
                  item.dataType === "Orders Completed" ? "#00c950" : "#4a90e2",
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
  avgSessionDuration: "3m 45s",
  bounceRate: "42%",
  deviceConversion: [
    { deviceType: "Desktop", rate: 55 },
    { deviceType: "Mobile", rate: 35 },
    { deviceType: "Tablet", rate: 10 },
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
                  backgroundColor: "#4a90e2",
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
  {
    title: "Weekly Sales Summary",
    schedule: "Every Monday at 8:00 AM",
  },
  {
    title: "Monthly Revenue Report",
    schedule: "1st of every month at 9:00 AM",
  },
  {
    title: "Quarterly Customer Insights",
    schedule: "1st of Jan, Apr, Jul, Oct at 10:00 AM",
  },
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
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              justifyContent: "center",
            }}
          >
            <IconSymbol
              name="calendar"
              size={24}
              color="#2059b2"
              style={{
                backgroundColor: "#0e1a2e",
                padding: 16,
                borderRadius: 8,
              }}
            />
            <View
              style={{
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: Typography.md,
                  fontWeight: "600",
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: theme.tint,
                  fontSize: Typography.sm,
                }}
              >
                {item.schedule}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "#0a221d",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "#00c950",
              }}
            />
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
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

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
  };

  const showDaetePicker = () => {
    setShowPicker(true);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ReportsHeader
        onBack={() => {}}
        onRefresh={() => {}}
        onDownload={() => {}}
        title="Reports"
        subtitle="Analytics & Insights"
      />
      <View>
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
                  <Picker
                    selectedValue={selectedValue}
                    style={{
                      height: 50,
                      width: 150,
                      color: theme.text,
                      backgroundColor: theme.cardBg,
                    }}
                    onValueChange={(itemValue) =>
                      setSelectedValue(itemValue as string)
                    }
                  >
                    <Picker.Item label="Income Report" value="income" />
                    <Picker.Item label="Expenses Report" value="expenses" />
                    <Picker.Item
                      label="Profit & Loss Report"
                      value="profit_loss"
                    />
                  </Picker>
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
          {SALES_DATA.map((item, index) => (
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
                  timeframe === "month" ? theme.tabIconSelected : theme.cardBg,
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
    </ScrollView>
  );
}
