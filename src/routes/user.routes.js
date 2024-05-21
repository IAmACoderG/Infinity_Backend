import { Router } from "express";
import { changeAvatar, changeCoverImage, changePassword, currentUser, followOrUnfollow, getAllUsers, getMyPosts, getUserPosts, getUserProfile, logInUser, logOutUser, myProfile, refreshTokenAgainGeneratedAccess, registerUser, updateUserDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtValidation } from "../middlewares/jwt.middleware.js"
const router = Router();

router.route("/register").post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            },
        ]
    ),
    registerUser);
router.route("/login").post(logInUser);
router.route("/logout").get(jwtValidation, logOutUser);
router.route("/again-user-access").post(refreshTokenAgainGeneratedAccess);
router.route("/change-password").post(jwtValidation, changePassword);
router.route("/change-avatar").patch(jwtValidation, upload.single("avatar"), changeAvatar);
router.route("/change-coverImage").patch(jwtValidation, upload.single("coverImage"), changeCoverImage);
router.route("/update-user-details").patch(jwtValidation, updateUserDetails);
// router.route("/current-user").get(jwtValidation, currentUser);
router.route("/user-profile").get(jwtValidation, myProfile);
router.route("/all-users").get(jwtValidation, getAllUsers);

router.route("/follow/:id").get(jwtValidation, followOrUnfollow)
router.route("/user_profile/:id").get(jwtValidation, getUserProfile);

router.route("/my-post").get(jwtValidation, getMyPosts);

router.route("/user-post/:id").get(jwtValidation, getUserPosts);


export default router;
