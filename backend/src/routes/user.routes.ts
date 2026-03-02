import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, UserController.getAllUsers);
router.get('/:id', requireAuth, UserController.getUserById);

export default router;
