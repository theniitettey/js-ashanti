import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AdminController } from '../controllers/admin.controller';
import { InsightController } from '../controllers/insight.controller';
import { getSession } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes here (mostly admin)
router.use(getSession);

// Analytics
router.get('/analytics/stats', AnalyticsController.getStats);
router.get('/admin/metrics', AnalyticsController.getMetrics);

// Admin Batches
router.get('/admin/batches', AdminController.getBatches);
router.get('/admin/jobs', AdminController.getJobs);
router.get('/admin/dead-letter-queue', AdminController.getDeadLetterQueue);
router.post('/admin/batches/:batchId/analyze', AdminController.triggerBatchAnalysis);

// Insights
router.get('/insights', InsightController.getInsights);

export default router;
