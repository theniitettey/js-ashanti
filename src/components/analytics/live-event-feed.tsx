"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./socket-provider";
import { UserEvent } from "@/interface/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LiveEventFeed() {
  const { socket, isConnected } = useSocket();
  const [events, setEvents] = useState<UserEvent[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join admin room to receive events
    socket.emit("admin:join");

    // Listen for incoming events
    socket.on("admin:event", (event: UserEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50
    });

    return () => {
      socket.emit("admin:leave");
      socket.off("admin:event");
    };
  }, [socket]);

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      USER_LOGIN: "bg-green-500",
      PAGE_VIEW: "bg-blue-500",
      PRODUCT_VIEW: "bg-purple-500",
      ADD_TO_CART: "bg-orange-500",
      REMOVE_FROM_CART: "bg-red-500",
      CHECKOUT_START: "bg-yellow-500",
      CHECKOUT_COMPLETE: "bg-green-600",
    };
    return colors[eventType] || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Event Feed</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Waiting for events...
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.eventId}
                  className="border rounded-lg p-3 text-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getEventColor(event.eventType)}>
                      {event.eventType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>User:</strong> {event.userId}
                    </p>
                    {event.page && (
                      <p>
                        <strong>Page:</strong> {event.page}
                      </p>
                    )}
                    {event.metadata &&
                      Object.keys(event.metadata).length > 0 && (
                        <p>
                          <strong>Data:</strong>{" "}
                          {JSON.stringify(event.metadata, null, 2)}
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
