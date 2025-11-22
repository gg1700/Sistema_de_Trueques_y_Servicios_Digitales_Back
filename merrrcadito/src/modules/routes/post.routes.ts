import { Router } from 'express';
import * as PostController from '../controllers/post.controller';
import multer from 'multer';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', upload.single('foto_pub'), PostController.createPost);

router.get('/all_active_product_posts', PostController.getAllActiveProductPosts);

export default router;