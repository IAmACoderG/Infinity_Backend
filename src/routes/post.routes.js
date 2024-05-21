import { Router } from "express";
import { jwtValidation } from "../middlewares/jwt.middleware.js";
import { addCommentOnPost, deletePost, editCaption, followingPostView, likeOrUnlike, newPost } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/add_post").post(upload.fields(
    [
        {
            name: "imageFile",
            maxCount: 1
        },
    ]
), jwtValidation, newPost);

router.route("/accessed_Id/:id")
    .post(jwtValidation,addCommentOnPost)
    .get(jwtValidation, likeOrUnlike)
    .put(jwtValidation, editCaption)
    .delete(jwtValidation, deletePost);

router.route("/following-user-posts").get(jwtValidation, followingPostView);


export default router;