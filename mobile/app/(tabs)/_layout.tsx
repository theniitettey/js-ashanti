import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, StyleSheet, Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isDark
            ? "rgba(5, 5, 6, 0.78)"
            : "rgba(248, 250, 252, 0.82)",
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 6,
          height: Platform.OS === "ios" ? 88 : 68,
          // Subtle top glow line
          shadowColor: isDark ? "#5E6AD2" : "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: isDark ? 0.15 : 0.04,
          shadowRadius: isDark ? 12 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <IconSymbol size={24} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <IconSymbol size={24} name="chart.bar.fill" color={color} />
            </View>
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
              // @ts-ignore
              style={[(props as any)?.style, styles.liftedButton]}
            >
              <View style={styles.fabOuter}>
                <View style={[styles.fabInner, { backgroundColor: theme.primary }]}>
                  <IconSymbol
                    size={22}
                    name="plus"
                    color={theme.primaryForeground}
                    weight="bold"
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
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <IconSymbol size={24} name="cube.box.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerBackButtonDisplayMode: "minimal",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <IconSymbol size={24} name="gearshape.fill" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrap: {
    transform: [{ scale: 1.1 }],
  },
  liftedButton: {
    justifyContent: "center",
    alignItems: "center",
    top: -22,
  },
  fabOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    // Indigo glow
    shadowColor: "#5E6AD2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
