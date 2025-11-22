import { Router } from 'express';
import * as PostController from '../controllers/post.controller';


const router = Router();

router.post('/create',  PostController.createPost);

router.get('/all_active_product_posts', PostController.getAllActiveProductPosts);

export default router;