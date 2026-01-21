import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration - supports environment variables via Expo
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/sign-in/email`,
    SESSION: `${API_BASE_URL}/api/auth/get-session`,
    LOGOUT: `${API_BASE_URL}/api/auth/sign-out`,
  },
  MOBILE: {
    PRODUCTS: {
      LIST: `${API_BASE_URL}/api/mobile/products`,
      CREATE: `${API_BASE_URL}/api/mobile/products`,
    },
    ANALYTICS: {
      DASHBOARD: `${API_BASE_URL}/api/mobile/analytics/dashboard`,
      REPORTS: `${API_BASE_URL}/api/mobile/analytics/reports`,
      AI_INSIGHTS: `${API_BASE_URL}/api/mobile/analytics/ai-insights`,
    },
    INVENTORY: {
      METRICS: `${API_BASE_URL}/api/mobile/inventory/metrics`,
    },
  },
};

export const apiRequest = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type");

    // Check if response is JSON
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed with status ${response.status}`,
        );
      }

      return data;
    } else {
      // Response is not JSON (likely HTML error page)
      const text = await response.text();
      console.error(`[API] Non-JSON response: ${text.substring(0, 200)}`);
      throw new Error(`Server returned non-JSON response (${response.status})`);
    }
  } catch (error: any) {
    console.error("API Request Error:", error);
    throw error;
  }
};

export const apiRequestWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    return apiRequest(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error("Authenticated API Request Error:", error);
    throw error;
  }
};
