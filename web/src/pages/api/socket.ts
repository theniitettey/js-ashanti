import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { UserEvent } from "@/interface/analytics";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

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
  res: NextApiResponseServerIO,
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

  // Start metrics broadcast on first connection
  let metricsInterval: NodeJS.Timeout | null = null;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Start metrics broadcast if not running
    if (!metricsInterval) {
      metricsInterval = setInterval(() => {
        io.emit("metrics_update", {
          currentVisitors: Math.floor(Math.random() * 500) + 100,
          activeVisitors: Math.floor(Math.random() * 300) + 50,
          pageViewsPerMin: Math.floor(Math.random() * 100) + 20,
          timestamp: new Date().toISOString(),
        });
      }, 2000);
    }

    // Send initial metrics
    socket.emit("metrics_update", {
      currentVisitors: Math.floor(Math.random() * 500) + 100,
      activeVisitors: Math.floor(Math.random() * 300) + 50,
      pageViewsPerMin: Math.floor(Math.random() * 100) + 20,
      timestamp: new Date().toISOString(),
    });

    // Listen for user events
    socket.on("user:event", async (event: UserEvent) => {
      try {
        // Validate event structure
        if (!event.eventId || !event.eventType || !event.userId) {
          console.error("Invalid event structure:", event);
          return;
        }

        console.log("Received event:", event.eventType, event.eventId);

        // 1. Find or create OPEN batch
        let batch = await prisma.batch.findFirst({
          where: { status: "OPEN" },
          orderBy: { created_at: "desc" },
        });

        if (!batch) {
          batch = await prisma.batch.create({
            data: {
              batch_id: nanoid(),
              status: "OPEN",
              event_count: 0,
            },
          });
          console.log("Created new batch:", batch.batch_id);
        }

        // 2. Write event to database
        await prisma.event.create({
          data: {
            batch_id: batch.batch_id,
            event_type: event.eventType,
            user_id: event.userId,
            data: event.metadata || {},
            timestamp: new Date(event.timestamp),
          },
        });

        // 3. Increment batch count
        await prisma.batch.update({
          where: { id: batch.id },
          data: { event_count: { increment: 1 } },
        });

        console.log(
          `Event ${event.eventId} written to batch ${batch.batch_id} (count: ${batch.event_count + 1})`,
        );

        // 4. Broadcast to admin dashboard (real-time)
        io.to("admin-room").emit("admin:event", event);

        // Acknowledge receipt
        socket.emit("event:ack", {
          eventId: event.eventId,
          batchId: batch.batch_id,
        });
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
