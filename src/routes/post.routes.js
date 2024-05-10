import { Router } from "express";
import { jwtValidation } from "../middlewares/jwt.middleware.js";
import { deletePost, editCaption, followingPostView, likeOrUnlike, newPost } from "../controllers/post.controller.js";
const router = Router();

router.route("/add_post").post(jwtValidation, newPost);
router.route("/:id")
    .get(jwtValidation, likeOrUnlike)
    .put(jwtValidation, editCaption)
    .delete(jwtValidation, deletePost)
    .get(jwtValidation, followingPostView)


export default router;