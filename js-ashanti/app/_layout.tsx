import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { Text } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Crisp text: disable font scaling so text aligns to pixel grid (reduces blurriness)
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppColors, Colors } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/login");
    } else if (isAuthenticated && !inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: AppColors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor:
            colorScheme === "dark"
              ? "#1C1917"
              : Colors[colorScheme ?? "light"].background,
        }}
        edges={["top"]}
      >
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
