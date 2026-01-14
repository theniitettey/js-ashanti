import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, StyleSheet } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
        headerShown: false,
        tabBarButton: HapticTab,
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
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
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
                    backgroundColor:
                      Colors[colorScheme ?? "light"].tabIconSelected,
                  },
                ]}
              >
                <View
                  style={[
                    styles.whiteCircle,
                    {
                      backgroundColor: Colors["light"].background,
                    },
                  ]}
                >
                  <IconSymbol
                    size={20}
                    name="plus"
                    color={Colors[colorScheme ?? "light"].tabIconSelected}
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
    backgroundColor: "#fff",
    borderRadius: 999,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    // Android elevation
    elevation: 6,
  },
  coloredBg: {
    borderRadius: 999,
    padding: 10,
    minWidth: 76,
    minHeight: 76,
    justifyContent: "center",
    alignItems: "center",
    // subtle shadow for the colored bg
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
});
