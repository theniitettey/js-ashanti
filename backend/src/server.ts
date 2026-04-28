import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { initializeWebSocket } from './websocket/ws';

// Routes
import productRoutes from './routes/product.routes';
import uploadRoutes from './routes/upload.routes';
import reviewRoutes from './routes/review.routes';
import settingsRoutes from './routes/settings.routes';
import analysisRoutes from "./routes/analysis.routes";
import mobileRoutes from "./routes/mobile.routes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";
import paymentRoutes from "./routes/payment.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4001;

const configuredOrigin = process.env.FRONTEND_URL;
const allowedOrigins = new Set(
  [
    configuredOrigin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",
    "http://localhost:8082",
  ].filter(Boolean) as string[]
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no origin (mobile/Expo, Postman, etc.), Expo dev (exp://), and trusted origins.
      if (!origin || allowedOrigins.has(origin) || origin.startsWith("exp://")) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Initialize WebSocket
initializeWebSocket(httpServer);

// Inject Origin header for mobile clients where React Native fetch strips it.
app.use("/api/auth/*", (req, res, next) => {
  if (!req.headers.origin && req.headers["x-expo-origin"]) {
    req.headers.origin = req.headers["x-expo-origin"] as string;
  }
  next();
});

// Mount Better-Auth handler
app.all("/api/auth/*", toNodeHandler(auth));

// Mount routes (more specific paths first – /api/mobile before /api)
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/business-settings', settingsRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api', analysisRoutes); // Analytics/admin at /api root

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("[Server] Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// Export app and httpServer for testing or unified entry point
export { app, httpServer };

export function startServer() {
  const port = process.env.PORT || 4001;
  const host = process.env.HOST || "0.0.0.0";
  httpServer.listen(Number(port), host, () => {
    console.log(`[Server] API is running on http://${host}:${port}`);
  });
}

// Start immediately if run directly
if (require.main === module) {
  startServer();
}
