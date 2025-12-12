import { Router } from 'express';
import { upload } from '../config/multer.config';
import { uploadFile, getFile, deleteFile } from '../controllers/file.controller';

const router = Router();

router.post('/', upload.single('file'), uploadFile);
router.get('/:name', getFile);
router.delete('/:name', deleteFile);

export default router;