import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import user from "./routes/user.routes.js";
import post from "./routes/post.routes.js"


export const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes Declaration...>>>
app.use("/api/v1/users", user);
app.use("/api/v1/posts", post)

