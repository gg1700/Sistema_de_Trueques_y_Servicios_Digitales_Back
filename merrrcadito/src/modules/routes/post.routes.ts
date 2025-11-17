import { Router } from 'express';
import * as PostController from '../controllers/post.controller';

const router = Router();

router.post('/create',  PostController.createPost);

export default router;