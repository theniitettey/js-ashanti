"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { UserEvent } from "@/interface/analytics";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitEvent: (event: Omit<UserEvent, "eventId" | "timestamp">) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emitEvent: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io({
      path: "/api/socket",
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("event:ack", (data) => {
      console.log("Event acknowledged:", data.eventId);
    });

    socketInstance.on("event:error", (data) => {
      console.error("Event error:", data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emitEvent = (event: Omit<UserEvent, "eventId" | "timestamp">) => {
    if (!socket || !isConnected) {
      console.warn("Socket not connected, event not sent");
      return;
    }

    const fullEvent: UserEvent = {
      ...event,
      eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
    };

    socket.emit("user:event", fullEvent);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, emitEvent }}>
      {children}
    </SocketContext.Provider>
  );
}
