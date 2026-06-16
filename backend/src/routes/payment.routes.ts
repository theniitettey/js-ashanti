import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { getSession, requireAuth } from "../middleware/auth";

const router = Router();

router.post("/initiate", PaymentController.initiatePayment);
router.get("/:ref/status", PaymentController.getPaymentStatus);
router.post("/:ref/retry", PaymentController.retryPayment);
router.get("/", getSession, requireAuth, PaymentController.listPayments);

export default router;
