import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

let io: Server;
const clients = new Map<string, Socket>();
const socketRateState = new Map<string, { windowStart: number; count: number }>();
const userRateState = new Map<string, { windowStart: number; count: number }>();
const dedupeState = new Map<string, number>();

const RATE_WINDOW_MS = Number(process.env.ANALYTICS_RATE_WINDOW_MS || 10000);
const MAX_EVENTS_PER_SOCKET_PER_WINDOW = Number(
    process.env.ANALYTICS_MAX_EVENTS_PER_SOCKET || 80
);
const MAX_EVENTS_PER_USER_PER_WINDOW = Number(
    process.env.ANALYTICS_MAX_EVENTS_PER_USER || 120
);
const DEDUPE_WINDOW_MS = Number(process.env.ANALYTICS_DEDUPE_WINDOW_MS || 2000);
const MAX_METADATA_BYTES = Number(process.env.ANALYTICS_MAX_METADATA_BYTES || 4096);

type AnalyticsEventInput = {
    eventId: string;
    eventType: string;
    userId: string;
    sessionId: string;
    page?: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
};

function stableStringify(value: unknown): string {
    if (value === null || typeof value !== "object") return String(value);
    if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${k}:${stableStringify(obj[k])}`).join(",")}}`;
}

function withinRateLimit(
    stateMap: Map<string, { windowStart: number; count: number }>,
    key: string,
    now: number,
    maxAllowed: number
): boolean {
    const current = stateMap.get(key);
    if (!current || now - current.windowStart > RATE_WINDOW_MS) {
        stateMap.set(key, { windowStart: now, count: 1 });
        return true;
    }
    if (current.count >= maxAllowed) return false;
    current.count += 1;
    stateMap.set(key, current);
    return true;
}

function getDedupeKey(event: any): string {
    const metadataHash = createHash("sha256")
        .update(stableStringify(event.metadata || {}))
        .digest("hex")
        .slice(0, 16);
    return `${event.userId}|${event.eventType}|${event.page || ""}|${metadataHash}`;
}

function cleanupMaps(now: number) {
    const dedupeExpiry = DEDUPE_WINDOW_MS * 3;
    for (const [key, timestamp] of dedupeState.entries()) {
        if (now - timestamp > dedupeExpiry) dedupeState.delete(key);
    }

    const rateExpiry = RATE_WINDOW_MS * 3;
    for (const [key, state] of socketRateState.entries()) {
        if (now - state.windowStart > rateExpiry) socketRateState.delete(key);
    }
    for (const [key, state] of userRateState.entries()) {
        if (now - state.windowStart > rateExpiry) userRateState.delete(key);
    }
}

async function getOrCreateOpenBatch() {
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

    return batch;
}

async function persistAnalyticsEvent(event: AnalyticsEventInput) {
    const batch = await getOrCreateOpenBatch();
    const parsedTimestamp = new Date(event.timestamp);
    await prisma.event.create({
        data: {
            batch_id: batch.batch_id,
            event_type: event.eventType,
            user_id: event.userId,
            data: (event.metadata ?? {}) as unknown as Prisma.InputJsonValue,
            timestamp: Number.isNaN(parsedTimestamp.getTime()) ? new Date() : parsedTimestamp,
        },
    });

    await prisma.batch.update({
        where: { id: batch.id },
        data: { event_count: { increment: 1 } },
    });

    return batch.batch_id;
}

export async function trackSystemEvent(params: {
    eventType: string;
    metadata?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
    page?: string;
}) {
    const systemEvent: AnalyticsEventInput = {
        eventId: `${Date.now()}-${nanoid(8)}`,
        eventType: params.eventType,
        userId: params.userId || "system",
        sessionId: params.sessionId || "system",
        page: params.page,
        metadata: params.metadata || {},
        timestamp: new Date().toISOString(),
    };

    try {
        const batchId = await persistAnalyticsEvent(systemEvent);
        if (io) {
            io.to("admin-room").emit("admin:event", systemEvent);
        }
        return { ok: true, batchId };
    } catch (error) {
        console.error("[Analytics] Failed to track system event:", error);
        return { ok: false };
    }
}

export const initializeWebSocket = (httpServer: HttpServer) => {
    const configuredOrigin = process.env.FRONTEND_URL;
    const allowedOrigins = new Set(
        [configuredOrigin, "http://localhost:3000", "http://127.0.0.1:3000"].filter(
            Boolean
        ) as string[]
    );

    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.has(origin)) {
                    callback(null, true);
                    return;
                }
                callback(new Error("Not allowed by WebSocket CORS"));
            },
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

                const now = Date.now();
                const rawMetadata = stableStringify(event.metadata || {});
                if (Buffer.byteLength(rawMetadata, "utf8") > MAX_METADATA_BYTES) {
                    socket.emit("event:error", {
                        eventId: event.eventId,
                        code: "PAYLOAD_TOO_LARGE",
                        error: "Event metadata payload too large",
                    });
                    return;
                }

                const socketKey = socket.id;
                const userKey = String(event.userId);
                if (
                    !withinRateLimit(
                        socketRateState,
                        socketKey,
                        now,
                        MAX_EVENTS_PER_SOCKET_PER_WINDOW
                    )
                ) {
                    socket.emit("event:error", {
                        eventId: event.eventId,
                        code: "SOCKET_RATE_LIMITED",
                        error: "Too many events from this client. Please slow down.",
                    });
                    return;
                }

                if (
                    !withinRateLimit(
                        userRateState,
                        userKey,
                        now,
                        MAX_EVENTS_PER_USER_PER_WINDOW
                    )
                ) {
                    socket.emit("event:error", {
                        eventId: event.eventId,
                        code: "USER_RATE_LIMITED",
                        error: "Too many events for this user in a short time.",
                    });
                    return;
                }

                const dedupeKey = getDedupeKey(event);
                const seenAt = dedupeState.get(dedupeKey);
                if (seenAt && now - seenAt < DEDUPE_WINDOW_MS) {
                    socket.emit("event:ack", {
                        eventId: event.eventId,
                        deduped: true,
                    });
                    return;
                }
                dedupeState.set(dedupeKey, now);
                if (dedupeState.size > 3000) {
                    cleanupMaps(now);
                }

                const parsedTimestamp = new Date(event.timestamp);
                if (Number.isNaN(parsedTimestamp.getTime())) {
                    socket.emit("event:error", {
                        eventId: event.eventId,
                        code: "INVALID_TIMESTAMP",
                        error: "Event timestamp is invalid",
                    });
                    return;
                }

                console.log(`[WebSocket] Received event: ${event.eventType} (${event.eventId})`);
                const batchId = await persistAnalyticsEvent({
                    eventId: String(event.eventId),
                    eventType: String(event.eventType),
                    userId: String(event.userId),
                    sessionId: String(event.sessionId || "unknown"),
                    page: event.page ? String(event.page) : undefined,
                    metadata: event.metadata || {},
                    timestamp: parsedTimestamp.toISOString(),
                });

                // 4. Broadcast to admin dashboard
                io.to("admin-room").emit("admin:event", event);

                // Acknowledge receipt
                socket.emit("event:ack", {
                    eventId: event.eventId,
                    batchId,
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
            socketRateState.delete(socket.id);
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
