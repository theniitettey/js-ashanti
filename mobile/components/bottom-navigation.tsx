import { View, TouchableOpacity, Text } from "react-native";

interface NavItem {
  id: "home" | "reports" | "stock" | "settings";
  label: string;
  icon: string;
  route: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: "🏠", route: "/home" },
  { id: "reports", label: "Reports", icon: "📊", route: "/reports" },
  { id: "stock", label: "Stock", icon: "📦", route: "/stock" },
  { id: "settings", label: "Settings", icon: "⚙️", route: "/settings" },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onActionPress: () => void;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onActionPress,
}: BottomNavigationProps) {
  return (
    <View className="relative">
      <View className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
        <TouchableOpacity
          onPress={onActionPress}
          className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 items-center justify-center shadow-lg"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <Text className="text-3xl text-white">+</Text>
        </TouchableOpacity>
      </View>

      {/* Nav bar container */}
      <View className="bg-gray-900 border-t border-gray-800 flex-row items-center justify-around px-2 py-3">
        {/* Left side - 2 items */}
        <View className="flex-1 flex-row justify-around">
          {navItems.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              className="items-center gap-2"
            >
              <Text className="text-2xl">{item.icon}</Text>
              <Text
                className={`text-xs font-medium ${
                  activeTab === item.id ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Center spacer for FAB */}
        <View className="flex-1" />

        {/* Right side - 2 items */}
        <View className="flex-1 flex-row justify-around">
          {navItems.slice(2, 4).map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              className="items-center gap-2"
            >
              <Text className="text-2xl">{item.icon}</Text>
              <Text
                className={`text-xs font-medium ${
                  activeTab === item.id ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
