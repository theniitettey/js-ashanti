import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { getSession } from '../middleware/auth';

const router = Router();

router.use(getSession);

router.post('/', SettingsController.updateSettings);
router.get('/', SettingsController.getSettings);

export default router;
