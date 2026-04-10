import { Router } from "express";
import {
  CreatePostRequest,
  GetPosts,
  GetPostsById,
  UpdatePostStatus,
  RequestDeletePost,
  GetAllDeleteRequestedPosts,
  DeletePost,
  EditPost,
  GetPostsByUserId,
  getPostByUserId,
} from "../controllers/post.controller";
import { verifyAdmin, verifyUser } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();


router.get("/", GetPosts); // GET /api/posts/
router.get("/:id", GetPostsById); // GET /api/posts/:id
router.get("/user/:userId", verifyUser,GetPostsByUserId); // GET /api/posts/user/:userId
router.get("/user-recent/:userId",verifyUser, getPostByUserId); // GET /api/posts/user-recent/:userId

router.post("/", verifyUser, upload.single("image"), CreatePostRequest); // POST /api/posts/
router.put("/:id", verifyUser, EditPost); // PUT /api/posts/:id
router.put("/:id/delete-request", verifyUser, RequestDeletePost); // PUT /api/posts/:id/delete-request

router.get("/delete-requests", verifyAdmin, GetAllDeleteRequestedPosts); // GET /api/posts/delete-requests
router.put("/:id/status", verifyAdmin, UpdatePostStatus); // PUT /api/posts/:id/status
router.delete("/:id", verifyAdmin, DeletePost); // DELETE /api/posts/:id

export default router;