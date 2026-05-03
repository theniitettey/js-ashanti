import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS, apiRequest } from "@/lib/api";

const AUTH_STORAGE_KEYS = ["userToken", "userEmail", "userData"] as const;

async function clearAuthStorage() {
  await AsyncStorage.multiRemove([...AUTH_STORAGE_KEYS]);
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const email = await AsyncStorage.getItem("userEmail");

      if (!token) {
        return;
      }

      // Login fallback stores this placeholder when the API omits a Bearer token.
      if (token === "authenticated") {
        await clearAuthStorage();
        setIsAuthenticated(false);
        setUserEmail(null);
        return;
      }

      try {
        const data = await apiRequest(API_ENDPOINTS.AUTH.SESSION, {
          method: "GET",
          credentials: "omit",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const hasSession =
          data !== null &&
          typeof data === "object" &&
          Boolean(
            (data as { session?: unknown; user?: unknown }).session ||
              (data as { session?: unknown; user?: unknown }).user,
          );

        if (hasSession) {
          setIsAuthenticated(true);
          setUserEmail(email);
        } else {
          await clearAuthStorage();
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      } catch (error) {
        // Any failure (offline, timeout, 401, etc.) — cannot confirm session; treat as logged out.
        console.error("Session validation failed:", error);
        await clearAuthStorage();
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    await AsyncStorage.setItem("userToken", token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await clearAuthStorage();
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        userEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
