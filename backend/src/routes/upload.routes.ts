import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { getSession } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply auth middleware if uploads should be protected
router.use(getSession);

router.post('/', upload.single('file'), UploadController.uploadFile);

export default router;
