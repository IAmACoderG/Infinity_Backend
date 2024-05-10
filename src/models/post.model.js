import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    caption: {
        type: String
    },
    imageFile: {
        type: String, // Cloudinary Url ...>>>
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            comment: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;