import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { getSession, requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply auth middleware if uploads should be protected
router.use(getSession);

router.post('/', upload.single('file'), requireAuth, UploadController.uploadFile);

export default router;
