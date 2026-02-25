import { Router } from "express";
import { MobileController } from "../controllers/mobile.controller";
import { getSession, requireAuth } from "../middleware/auth";

const router = Router();

// Dashboard & Analytics (getSession reads Bearer token and sets req.session)
router.get("/analytics/dashboard", getSession, requireAuth, MobileController.getDashboard);
router.get("/analytics/reports", getSession, requireAuth, MobileController.getReports);
router.get("/analytics/ai-insights", getSession, requireAuth, MobileController.getAIInsights);

// Products & Inventory
router.get("/products", getSession, requireAuth, MobileController.getProducts);
router.post("/products", getSession, requireAuth, MobileController.createProduct);
router.get("/inventory/metrics", getSession, requireAuth, MobileController.getInventoryMetrics);

export default router;
