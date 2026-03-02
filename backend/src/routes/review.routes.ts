import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';

const router = Router();

router.post('/', ReviewController.createReview);
router.get('/:slug', ReviewController.getReviewsByProduct);

export default router;
