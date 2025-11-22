import { Router } from "express";
import * as PostController from "../controllers/post.controller";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post("/create", upload.single("image"), PostController.createPost);

router.get(
  "/all_active_product_posts",
  PostController.getAllActiveProductPosts
);

export default router;
