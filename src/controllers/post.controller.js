import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/responseHandler.js";
import Post from "../models/post.model.js";
import { User } from "../models/user.model.js";


export const newPost = asyncHandler(async (req, res) => {
    try {
        const newPostData = {
            caption: req.body.caption,
            owner: req.user._id
        }
        const newPost = await Post.create(newPostData);
        const user = await User.findById(req.user._id);
        user.posts.push(newPost._id);
        await user.save();

        return res.status(201).json(new ApiResponse(200, newPost, "New Post Added"))

    } catch (error) {
        throw new ApiError(500, "Internal Server Error In NewPost")
    }
});

export const editCaption = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) throw new ApiError(404, "Post Not found");
        if (post.owner.toString() !== re.user._id.toString()) {
            throw new ApiError(404, "User UnAuthrized");
        }
        post.caption = req.body.caption;
        await post.save();
        return res.status(200).json(new ApiResponse(200, "caption updated"))
    } catch (error) {
        throw new ApiError(500, "Internal Server Error In EditCaption");
    }
})

export const deletePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) throw new ApiError(404, "Post Not found");
        if (post.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(404, "Not Allow to Delete Post By the UnAuthorized User");
        }
        await post.remove();
        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);
        return res.status(200).json(new ApiResponse(200, "Deleted Post Successfully"))
    } catch (error) {
        throw new ApiError(500, "Internal Server Error In DeletePost")
    }
});

export const likeOrUnlike = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) throw new ApiError(404, "Post Not found");
        if (post.likes.includes(req.user._id)) {
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index, 1);
            await post.save();
            return res.status(200).json(new ApiResponse(200, "Unlike Done"))
        }
        else {
            post.likes.push(req.user._id);
            await post.save();
            return res.status(202).json(new ApiResponse(200, "like Done"))
        }
    } catch (error) {
        throw new ApiError(500, "Internal Server Error In likeOrUnlike")
    }
});

export const addCommentOnPost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) throw new ApiError(404, "Post Not found");
        post.comments.push({
            user: req.user._id,
            comment: req.body.comment
        });
        await post.save();
        return res.status(200).json(new ApiResponse(200, "comment Added on Post"))
    } catch (error) {
        throw new ApiError(500, "Internal Server Error In Add Comment On Post")
    }
});

export const deleteComments = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) throw new ApiError(404, "Post Not found");
        if (post.owner.toString() === req.user._id.toString()) {
            if (req.body.commentId === undefined) throw new ApiError(404, "Comment Id Required");
            post.comments.map((eachComment, index) => {
                if (eachComment._id.toString() === req.body.commentId.toString()) {
                    return post.comments.splice(index, 1);
                }
            });
            await post.save();
            return res.status(200).json(new ApiResponse(200, " comment Deleted By the Post Owner"));

        } else {
            post.comments.map((eachComment, index) => {
                if (eachComment.user.toString() === req.user._id.toString()) {
                    return post.comments.splice(index, 1);
                }
            });
            await post.save();
            return res.status(200).json(new ApiResponse(200, " comment Deleted By the Comment Owner"));
        }
    } catch (error) {
        throw new ApiError(500, "Internal Server Error In Delete Comments")
    }
});

export const followingPostView = asyncHandler(async (req, res) => {
    try {

        // 1.)  Check first Working Or Not ....

        // const user = await User.findById(req.user._id);
        // const allPosts = user.following.map(followingUser => followingUser.posts);
        // return res.status(200).json(ApiResponse(200, allPosts, "Following User Post"));

        // 2.)  populate all the Post inside the user.following ....

        // const user = await User.findById(req.user._id).populate("following", "posts")
        // return res.status(200).json(ApiResponse(200, user.following, "Following User Post"));

        // 3.) looking the post filter by the owners which id present in user.following

        const user = await User.findById(req.user._id);
        const followingPost = await Post.find({ owner: { $in: user.following } });
        return res.status(200).json(ApiResponse(200, followingPost, "Following User Post"));

    } catch (error) {
        throw new ApiError(500, "Internal Server Error In following Post View")
    }
});