import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';
import { nanoid } from 'nanoid';

let io: Server;
const clients = new Map<string, Socket>();

export const initializeWebSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`[WebSocket] Client connected: ${socket.id}`);
        clients.set(socket.id, socket);

        // Start broadcasting metrics if this is the first client (simulation)
        if (clients.size === 1) {
            // startMetricsBroadcast(); // Keep it commented out if you want to avoid spam, or uncomment if needed
        }

        // Listen for user events (Analytics)
        socket.on("user:event", async (event: any) => {
            try {
                if (!event.eventId || !event.eventType || !event.userId) {
                    console.error("[WebSocket] Invalid event structure:", event);
                    return;
                }

                console.log(`[WebSocket] Received event: ${event.eventType} (${event.eventId})`);

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

                // 4. Broadcast to admin dashboard
                io.to("admin-room").emit("admin:event", event);

                // Acknowledge receipt
                socket.emit("event:ack", {
                    eventId: event.eventId,
                    batchId: batch.batch_id,
                });
            } catch (error) {
                console.error("[WebSocket] Error processing event:", error);
                socket.emit("event:error", {
                    eventId: event.eventId,
                    error: "Failed to process event",
                });
            }
        });

        // Admin room management
        socket.on("admin:join", () => {
            socket.join("admin-room");
            console.log(`[WebSocket] Admin joined: ${socket.id}`);
        });

        socket.on("admin:leave", () => {
            socket.leave("admin-room");
            console.log(`[WebSocket] Admin left: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log(`[WebSocket] Client disconnected: ${socket.id}`);
            clients.delete(socket.id);
        });
    });

    return io;
};

// Simulation of metrics/alerts broadcasting
function startMetricsBroadcast() {
    setInterval(() => {
        if (clients.size === 0) return;

        const metrics = {
            currentVisitors: Math.floor(Math.random() * 500) + 100,
            activeVisitors: Math.floor(Math.random() * 300) + 50,
            pageViewsPerMin: Math.floor(Math.random() * 100) + 20,
            timestamp: new Date().toISOString(),
        };

        const message = {
            type: "metrics_update",
            data: metrics,
            timestamp: new Date().toISOString(),
        };

        io.emit('message', JSON.stringify(message));
    }, 2000);
}
