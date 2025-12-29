import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { UserEvent } from "@/interface/analytics";
import { queueEvent } from "@/lib/queue";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

/**
 * Initialize Socket.IO server
 */
export default async function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("Socket.IO already running");
    res.end();
    return;
  }

  console.log("Initializing Socket.IO server...");
  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Listen for user events
    socket.on("user:event", async (event: UserEvent) => {
      try {
        // Validate event structure
        if (!event.eventId || !event.eventType || !event.userId) {
          console.error("Invalid event structure:", event);
          return;
        }

        console.log("Received event:", event.eventType, event.eventId);

        // 1. Broadcast to admin dashboard (real-time)
        io.to("admin-room").emit("admin:event", event);

        // 2. Queue for async processing
        await queueEvent(event);

        // Acknowledge receipt
        socket.emit("event:ack", { eventId: event.eventId });
      } catch (error) {
        console.error("Error processing event:", error);
        socket.emit("event:error", {
          eventId: event.eventId,
          error: "Failed to process event",
        });
      }
    });

    // Admin room management
    socket.on("admin:join", () => {
      socket.join("admin-room");
      console.log("Admin joined:", socket.id);
    });

    socket.on("admin:leave", () => {
      socket.leave("admin-room");
      console.log("Admin left:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  console.log("Socket.IO server initialized");
  res.end();
}
