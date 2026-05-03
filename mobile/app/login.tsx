import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Typography from "@/constants/typography";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS, apiRequest } from "@/lib/api";
import { Colors } from "@/constants/theme";

// Importing ScrollView locally specifically for internal keyboard handling layout
import { ScrollView } from "react-native-gesture-handler";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.error) {
        setError(response.error.message || "Login failed");
        setLoading(false);
        return;
      }

      const token =
        response.token || response.session?.token || "authenticated";
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userEmail", email);
      if (response.user) {
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));
      }

      await login(token);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Animated.View
              entering={FadeInDown.delay(100).duration(600).springify().damping(14)}
              style={[styles.logoContainer, {
                backgroundColor: isDark ? "rgba(94, 106, 210, 0.12)" : "rgba(94, 106, 210, 0.08)",
                borderColor: isDark ? "rgba(94, 106, 210, 0.25)" : "rgba(94, 106, 210, 0.15)",
              }]}
            >
              <View style={styles.logoInner}>
                <IconSymbol name="bag.fill" size={36} color={theme.primary} />
              </View>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(200).duration(600).springify().damping(14)}
              style={[styles.title, { color: theme.foreground }]}
            >
              Welcome back
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(280).duration(600).springify().damping(14)}
              style={[styles.subtitle, { color: theme.mutedForeground }]}
            >
              Sign in to your Admin Dashboard
            </Animated.Text>
          </View>

          {/* Login Form */}
          <Animated.View
            entering={FadeInDown.delay(380).duration(600).springify().damping(16)}
            style={[styles.formContainer, {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              borderColor: theme.border,
            }]}
          >
            {error ? (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={[styles.errorContainer, { backgroundColor: theme.destructive + "15", borderColor: theme.destructive }]}
              >
                <IconSymbol
                  name="exclamationmark.circle.fill"
                  size={16}
                  color={theme.destructive}
                />
                <Text style={[styles.errorText, { color: theme.destructive }]}>{error}</Text>
              </Animated.View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Email Address</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : theme.background,
                borderColor: theme.border,
              }]}>
                <IconSymbol
                  name="envelope.fill"
                  size={18}
                  color={theme.mutedForeground}
                />
                <TextInput
                  style={[styles.input, { color: theme.foreground }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Password</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : theme.background,
                borderColor: theme.border,
              }]}>
                <IconSymbol
                  name="lock.fill"
                  size={18}
                  color={theme.mutedForeground}
                />
                <TextInput
                  style={[styles.input, { color: theme.foreground }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <IconSymbol
                    name={showPassword ? "eye.slash.fill" : "eye.fill"}
                    size={18}
                    color={theme.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: theme.primary },
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Text style={[styles.loginButtonText, { color: theme.primaryForeground }]}>Signing in...</Text>
              ) : (
                <>
                  <Text style={[styles.loginButtonText, { color: theme.primaryForeground }]}>Sign In</Text>
                  <IconSymbol
                    name="arrow.right"
                    size={16}
                    color={theme.primaryForeground}
                  />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(500)}
            style={styles.footer}
          >
            <View style={styles.footerDivider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.mutedForeground }]}>JS Ashanti</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>
            <Text style={[styles.footerVersion, { color: theme.mutedForeground }]}>
              Admin Dashboard v1.0 • Built with Expo
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    // Glow effect
    shadowColor: "#5E6AD2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.md,
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    gap: 18,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.sm,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: "600",
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: Typography.md,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
    // Button glow
    shadowColor: "#5E6AD2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: Typography.md,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontSize: Typography.sm,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    gap: 12,
  },
  footerDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footerVersion: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
