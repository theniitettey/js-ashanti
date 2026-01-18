import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { getSession } from '../middleware/auth';

const router = Router();

// Apply getSession middleware to all routes to populate req.session
router.use(getSession);

router.post('/', ProductController.createProduct);
router.get('/', ProductController.getProducts);
router.get('/:slug', ProductController.getProductBySlug);
router.put('/:slug', ProductController.updateProduct);
router.delete('/', ProductController.deleteProduct);

export default router;
