/// <reference types="node" />

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4001";
const socket = io(SOCKET_URL);

let ackCount = 0;
const TOTAL_EVENTS = 5;

socket.on("connect", () => {
    console.log("Connected to backend WebSocket");

    // Simulate events
    for (let i = 0; i < TOTAL_EVENTS; i++) {
        const event = {
            eventId: `evt-${Date.now()}-${i}`,
            eventType: "page_view",
            userId: "test-user-1",
            metadata: { path: "/products", duration: Math.random() * 100 },
            timestamp: new Date().toISOString()
        };

        console.log(`Sending event ${i + 1}/${TOTAL_EVENTS}:`, event.eventId);
        socket.emit("user:event", event);
    }
});

socket.on("event:ack", (data) => {
    console.log("Received ACK for event:", data.eventId, "Batch:", data.batchId);
    ackCount++;

    if (ackCount === TOTAL_EVENTS) {
        console.log("All events acknowledged. Test passed.");
        socket.disconnect();
        process.exit(0);
    }
});

socket.on("event:error", (data) => {
    console.error("Error processing event:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

// Timeout
setTimeout(() => {
    if (ackCount < TOTAL_EVENTS) {
        console.error("Test timed out before receiving all ACKs");
        process.exit(1);
    }
}, 10000);
