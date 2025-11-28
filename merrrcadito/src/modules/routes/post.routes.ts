import { Router } from "express";
import * as PostController from "../controllers/post.controller";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post("/create", upload.single("foto_pub"), PostController.createPost);

router.get(
  "/all_active_product_posts",
  PostController.getAllActiveProductPosts
);

router.get('/:cod_pub', PostController.getPostById);
router.get("/explore/:userId", PostController.getAllPostsExceptUser);

export default router;
