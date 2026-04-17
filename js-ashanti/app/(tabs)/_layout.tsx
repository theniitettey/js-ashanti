import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, StyleSheet, Text } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          headerTitle: () => (
            <View>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: theme.foreground }}
              >
                Reports
              </Text>
              <Text style={{ fontSize: 12, color: theme.mutedForeground }}>
                Analytics & Insights
              </Text>
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              // merge styles so the button visually appears lifted
              // @ts-ignore
              style={[(props as any)?.style, styles.liftedButton]}
            >
              <View
                style={[
                  styles.coloredBg,
                  {
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <View
                  style={[
                    styles.whiteCircle,
                    {
                      backgroundColor: theme.primary,
                    },
                  ]}
                >
                  <IconSymbol
                    size={20}
                    name="plus"
                    color={theme.primaryForeground}
                  />
                </View>
              </View>
            </HapticTab>
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: "Stock",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cube.box.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerBackButtonDisplayMode: "minimal",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  liftedButton: {
    justifyContent: "center",
    alignItems: "center",
    top: -18,
  },
  whiteCircle: {
    borderRadius: 999,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  coloredBg: {
    borderRadius: 999,
    padding: 10,
    minWidth: 76,
    minHeight: 76,
    justifyContent: "center",
    alignItems: "center",
    // container shadow instead
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});
