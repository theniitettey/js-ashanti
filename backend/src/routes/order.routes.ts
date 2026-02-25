import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { getSession, requireAuth } from '../middleware/auth';

const router = Router();

router.post('/checkout', OrderController.checkout);
router.get('/:orderId/status', OrderController.getOrderStatus);

router.get('/', getSession, requireAuth, OrderController.listOrders);
router.post('/:orderId/fulfill', getSession, requireAuth, OrderController.fulfillOrder);
router.post('/:orderId/cancel', getSession, requireAuth, OrderController.cancelOrder);

export default router;
