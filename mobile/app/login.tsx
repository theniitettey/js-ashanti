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
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Typography from "@/constants/typography";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS, apiRequest } from "@/lib/api";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

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
            <View style={[styles.logoContainer, { backgroundColor: theme.muted, borderColor: theme.border }]}>
                <IconSymbol name="bag.fill" size={40} color={theme.foreground} />
            </View>
            <Text style={[styles.title, { color: theme.foreground }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>Sign in to your Admin Dashboard</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
            {error ? (
                <View style={[styles.errorContainer, { backgroundColor: theme.destructive + "15", borderColor: theme.destructive }]}>
                <IconSymbol
                    name="exclamationmark.circle.fill"
                    size={16}
                    color={theme.destructive}
                />
                <Text style={[styles.errorText, { color: theme.destructive }]}>{error}</Text>
                </View>
            ) : null}

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Email Address</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
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
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
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
                <Text style={[styles.forgotPasswordText, { color: theme.mutedForeground }]}>Forgot Password?</Text>
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
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Importing ScrollView locally specifically for internal keyboard handling layout
import { ScrollView } from "react-native-gesture-handler";

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
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.md,
    textAlign: "center",
  },
  formContainer: {
    gap: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent', // Will be visually distinct if shaded
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 8,
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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
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
    borderRadius: 12,
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: Typography.md,
    fontWeight: "600",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: Typography.sm,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
