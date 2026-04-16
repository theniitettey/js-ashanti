import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration - supports environment variables via Expo
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4001"
).replace(/\/+$/, "");

const REQUEST_TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;

export class ApiError extends Error {
  status?: number;
  url?: string;
  isTransient?: boolean;

  constructor(
    message: string,
    opts?: { status?: number; url?: string; isTransient?: boolean },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
    this.url = opts?.url;
    this.isTransient = opts?.isTransient;
  }
}

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
  let lastError: unknown;
  const method = (options.method || "GET").toUpperCase();
  const isRetryableMethod = method === "GET";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Expo-Origin": "http://localhost:8081",
          ...options.headers,
        },
      });

      const contentType = response.headers.get("content-type");

      // Check if response is JSON
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
          const message =
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`;

          const transient =
            response.status >= 500 || response.status === 429;
          const canRetry =
            transient && isRetryableMethod && attempt < MAX_RETRIES;

          if (canRetry) {
            await new Promise((resolve) =>
              setTimeout(resolve, 300 * (attempt + 1)),
            );
            continue;
          }

          throw new ApiError(message, {
            status: response.status,
            url,
            isTransient: transient,
          });
        }

        return data;
      } else {
        // Response is not JSON (likely HTML error page)
        const text = await response.text();
        const looksLikeHtml =
          text.includes("<!DOCTYPE html>") || text.includes("<html");
        const likelyWrongBaseUrl = looksLikeHtml && response.status === 404;
        const message = likelyWrongBaseUrl
          ? `API base URL is likely misconfigured (received HTML 404 at ${url}).`
          : `Server returned non-JSON response (${response.status})`;

        throw new ApiError(message, {
          status: response.status,
          url,
          isTransient: response.status >= 500,
        });
      }
    } catch (error: any) {
      const isAbort = error?.name === "AbortError";
      const isNetwork =
        isAbort ||
        error?.message?.includes("Network request failed") ||
        error?.message?.includes("Failed to fetch");
      const canRetry = isNetwork && isRetryableMethod && attempt < MAX_RETRIES;

      if (canRetry) {
        await new Promise((resolve) =>
          setTimeout(resolve, 300 * (attempt + 1)),
        );
        continue;
      }

      lastError = isAbort
        ? new ApiError("Request timed out. Please try again.", {
            url,
            isTransient: true,
          })
        : error;
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  console.error("API Request Error:", lastError);
  throw lastError;
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
