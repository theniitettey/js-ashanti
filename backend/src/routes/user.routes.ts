import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { getSession, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', getSession, requireAuth, UserController.getAllUsers);
router.get('/:id', getSession, requireAuth, UserController.getUserById);

export default router;
