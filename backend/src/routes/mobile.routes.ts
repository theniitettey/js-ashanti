import { Router } from "express";
import { MobileController } from "../controllers/mobile.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Dashboard & Analytics
router.get("/analytics/dashboard", requireAuth, MobileController.getDashboard);
router.get("/analytics/reports", requireAuth, MobileController.getReports);
router.get("/analytics/ai-insights", requireAuth, MobileController.getAIInsights);

// Products & Inventory
router.get("/products", requireAuth, MobileController.getProducts);
router.get("/inventory/metrics", requireAuth, MobileController.getInventoryMetrics);

export default router;
