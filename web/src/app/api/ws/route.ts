import { NextRequest } from "next/server";

const clients = new Map<string, WebSocket>();
const intervals = new Map<string, NodeJS.Timeout>();

function broadcastMetricsUpdate() {
  const metrics = {
    currentVisitors: Math.floor(Math.random() * 500) + 100,
    activeVisitors: Math.floor(Math.random() * 300) + 50,
    pageViewsPerMin: Math.floor(Math.random() * 100) + 20,
    timestamp: new Date().toISOString(),
  };

  const message = JSON.stringify({
    type: "metrics_update",
    data: metrics,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client, id) => {
    try {
      client.send(message);
    } catch (error) {
      console.error(`[WebSocket] Failed to send to client ${id}:`, error);
      clients.delete(id);
    }
  });
}

function broadcastInventoryAlert(clientId: string) {
  const message = JSON.stringify({
    type: "alert",
    data: {
      severity: "warning",
      message: "Low inventory alert for Product XYZ",
      product: "Summer Dress",
      currentStock: 5,
      minimumStock: 10,
    },
    timestamp: new Date().toISOString(),
  });

  const client = clients.get(clientId);
  if (client && client.readyState === WebSocket.OPEN) {
    try {
      client.send(message);
    } catch (error) {
      console.error(`[WebSocket] Failed to send alert:`, error);
    }
  }
}

// This is a Node.js WebSocket upgrade handler
export async function GET(request: NextRequest) {
  const upgrade = request.headers.get("upgrade");
  const connection = request.headers.get("connection");

  if (upgrade !== "websocket" || connection !== "Upgrade") {
    return new Response("Not a WebSocket request", { status: 400 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  try {
    // In a real app, validate the token here
    // For now, we'll accept connections with or without token

    // Create a unique ID for this client
    const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Note: In a real Next.js app with WebSocket support, you would use a library
    // like socket.io or upgrade the connection here. This is a simplified example
    // that won't work in the serverless environment.

    console.log(`[WebSocket] Client connected: ${clientId}`);

    // Start broadcasting metrics updates if this is the first client
    if (clients.size === 0) {
      const broadcastInterval = setInterval(broadcastMetricsUpdate, 2000);
      intervals.set("metrics", broadcastInterval);
    }

    // Client would be added here in a real implementation
    // clients.set(clientId, websocket);

    return new Response(
      "WebSocket upgrade required (use socket.io for serverless)",
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error("[WebSocket] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Cleanup on server shutdown
if (typeof global !== "undefined") {
  (global as any).wsCleanup = () => {
    intervals.forEach((interval) => clearInterval(interval));
    clients.clear();
  };
}
