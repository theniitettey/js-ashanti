"use client";

import { useEffect } from "react";
import { useSocket } from "@/components/analytics/socket-provider";
import { EventType } from "@/interface/analytics";
import { usePathname } from "next/navigation";

/**
 * Hook for tracking user events
 */
export function useAnalytics() {
  const { emitEvent } = useSocket();
  const pathname = usePathname();

  // Track page views automatically
  useEffect(() => {
    if (!pathname) return; // Skip if pathname is null

    const userId = getUserId();
    const sessionId = getSessionId();

    emitEvent({
      eventType: EventType.PAGE_VIEW,
      userId,
      sessionId,
      page: pathname,
      metadata: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
    });
  }, [pathname, emitEvent]);

  // Manual tracking methods
  const trackEvent = (eventType: string, metadata?: Record<any, any>) => {
    emitEvent({
      eventType,
      userId: getUserId(),
      sessionId: getSessionId(),
      page: pathname || undefined,
      metadata,
    });
  };

  const trackProductView = (productId: string, productName: string) => {
    trackEvent(EventType.PRODUCT_VIEW, { productId, productName });
  };

  const trackAddToCart = (productId: string, quantity: number) => {
    trackEvent(EventType.ADD_TO_CART, { productId, quantity });
  };

  const trackRemoveFromCart = (productId: string) => {
    trackEvent(EventType.REMOVE_FROM_CART, { productId });
  };

  const trackCheckout = (step: "start" | "complete", orderValue?: number) => {
    trackEvent(
      step === "start" ? EventType.CHECKOUT_START : EventType.CHECKOUT_COMPLETE,
      { orderValue }
    );
  };

  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent(EventType.SEARCH, { query, resultsCount });
  };

  return {
    trackEvent,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckout,
    trackSearch,
  };
}

/**
 * Get or create user ID (stored in localStorage)
 */
function getUserId(): string {
  if (typeof window === "undefined") return "server";

  let userId = localStorage.getItem("analytics_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("analytics_user_id", userId);
  }
  return userId;
}

/**
 * Get or create session ID (stored in sessionStorage)
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}
