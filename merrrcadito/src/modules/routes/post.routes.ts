import { Router } from 'express';
import * as PostController from '../controllers/post.controller';
import multer from 'multer';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', upload.single('foto_pub'), PostController.createPost);


router.get('/all_active_product_posts', PostController.getAllActiveProductPosts);
router.get('/all_active_service_posts', PostController.getAllActiveServicePosts);

router.get('/explore_products', PostController.getExploreProducts);
router.get('/explore_services', PostController.getExploreServices);
router.get('/:cod_pub/image', PostController.getPostImage);


router.get('/:cod_pub', PostController.getPostById);

export default router;