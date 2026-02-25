"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSocket } from "@/components/analytics/socket-provider";
import { EventType } from "@/interface/analytics";

function getUserId(): string {
  if (typeof window === "undefined") return "server";
  let userId = localStorage.getItem("analytics_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("analytics_user_id", userId);
  }
  return userId;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

export function GlobalPageTracker() {
  const pathname = usePathname();
  const { emitEvent } = useSocket();

  useEffect(() => {
    if (!pathname) return;
    emitEvent({
      eventType: EventType.PAGE_VIEW,
      userId: getUserId(),
      sessionId: getSessionId(),
      page: pathname,
      metadata: {
        referrer: typeof document !== "undefined" ? document.referrer : "",
      },
    });
  }, [pathname, emitEvent]);

  return null;
}
