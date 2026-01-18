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

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize WebSocket
initializeWebSocket(httpServer);

// Mount Better-Auth handler
app.all("/api/auth/*", toNodeHandler(auth));

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/business-settings', settingsRoutes);
app.use('/api', analysisRoutes); // Mount at /api root as routes already contain prefixes
app.use('/api/mobile', mobileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Export app and httpServer for testing or unified entry point
export { app, httpServer };

export function startServer() {
  const port = process.env.PORT || 4001;
  httpServer.listen(port, () => {
    console.log(`[Server] API is running on port ${port}`);
  });
}

// Start immediately if run directly
if (require.main === module) {
  startServer();
}
