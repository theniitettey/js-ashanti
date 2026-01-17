import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Typography from "@/constants/typography";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS, apiRequest } from "@/lib/api";

const palette = {
  background: "#000000",
  card: "#1A1F2E",
  primary: "#6B5FED",
  textPrimary: "#FFFFFF",
  textSecondary: "#9CA3AF",
  inputBorder: "#374151",
  danger: "#EF4444",
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    // Basic validation
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
      // Call better-auth API endpoint
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

      // Store session token and user info
      const token =
        response.token || response.session?.token || "authenticated";
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userEmail", email);
      if (response.user) {
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));
      }

      // Update auth context state
      await login(token);

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <IconSymbol name="bag.fill" size={48} color={palette.primary} />
          </View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol
                name="exclamationmark.circle.fill"
                size={20}
                color={palette.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                name="envelope.fill"
                size={18}
                color={palette.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={palette.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                name="lock.fill"
                size={18}
                color={palette.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={palette.textSecondary}
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
                  color={palette.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginButtonText}>Signing in...</Text>
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <IconSymbol
                  name="arrow.right"
                  size={18}
                  color={palette.textPrimary}
                />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.md,
    color: palette.textSecondary,
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2D1616",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.sm,
    color: palette.danger,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: Typography.md,
    color: palette.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: palette.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: Typography.md,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  forgotPassword: {
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: Typography.sm,
    color: palette.primary,
    fontWeight: "600",
  },
  footer: {
    marginTop: 48,
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: palette.inputBorder,
  },
  footerText: {
    fontSize: Typography.xs,
    color: palette.textSecondary,
    textAlign: "center",
  },
});
