import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";

const getAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something Went Wrong While Generating Refresh and Access Token")
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    //Get User Details from frontend ->req.body
    //validation - note Empty or Depands
    //check if user Already Exist ..from email and username or depends
    //check image and avatar uploaded or not
    //Avatar Required field in model
    //upload them at cloudinary
    //create user in object for entry in DB
    //remove password and token to response
    //check for creation
    //if created send response

    //Step 1.Get User Details from frontend..>>>
    const { username, fullName, email, password } = req.body;

    //Step 2.validation - note Empty or Depands..>>>
    if ([username, fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field are Required")
    }

    //Step 3. Check if user Already Exist ..from email and username or depends..>>>
    const existOrNot = await User.findOne({ $or: [{ email }, { username }] });
    if (existOrNot) { throw new ApiError(409, "Email Or Username Already Exist") }

    //Step 4. check image and avatar uploaded or not..>>>

    // optional chaining Approach .........>>>>>>>>>
    //  const avatarLocalPath = req.files?.avatar?.path; 
    // const coverImageLocalPath = req.files?.coverImage?.path;

    // optional chaining Approach is working if field passed by the user in req.body or we can say req.files beause we used middleware multer for passing files. but if field not pass by the user in that case Error Occurs..for that reason take a Different Approach .....>>>>

    // Old School Approach if The codition are true pass the value in varible or else pass the null ....>>>>>>
    const avatarLocalPath = req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0 ? req.files.avatar[0].path : null
    const coverImageLocalPath = req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ? req.files.coverImage[0].path : null



    //Step 5. check the Avatar field..>>>
    if (!avatarLocalPath) { throw new ApiError(400, "Avatar is Required") }

    //Step 6.upload them at cloudinary..>>>
    const avatarUploded = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploded = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatarUploded);
    console.log(coverImageUploded);
    //Check Because avatar field Required in user Model
    if (!avatarUploded) { throw new ApiError(400, "Avatar is not uploaded in Cloud! Some Error Occur") }

    const user = await User.create({ username, fullName, email, password, avatar: avatarUploded.url, coverImage: coverImageUploded?.url || "", })

    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if (!userCreated) { throw new ApiError(500, "Something Went Wrong While Registering the User") }

    return res.status(201).json(new ApiResponse(200, userCreated, "User Created Successfully"))
})

export const logInUser = asyncHandler(async (req, res) => {
    // GET Data from User -> req.body
    // Username or email
    // find the user
    // password check
    // Access and refresh token

    // Step 1.GET Data from User -> req.body ....>>>>
    const { username, email, password } = req.body;

    // Step 2.Username or Email Required .....>>>>>
    //both Works and same result also...>>
    if (!(username || email)) { throw new ApiError(401, "Username Or Email Required For LogIn") };
    // if (!username && !email) { throw new ApiError(401, "Username Or Email Required For LogIn") };

    // Step 3.find the user .....>>>>>
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) { throw new ApiError(402, "User Not Found") };

    // Step 4.password check ....>>>>
    const passwordMatched = await user.isPasswordCorrect(password);
    if (!passwordMatched) { throw new ApiError(404, "Your Password Is Wrong") }

    // Step 5.Get Access & Refresh Token ....>>>>>
    const { accessToken, refreshToken } = await getAccessTokenAndRefreshToken(user._id);

    //new access of User after Saving the refresh Token in User
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const optionForSequreCookies = { httpOnly: true, secure: true };

    return res.status(200).cookie("refreshToken", refreshToken, optionForSequreCookies).cookie("accessToken", accessToken, optionForSequreCookies).json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "Log In Successfully"))
})

export const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });
    const optionForSequreCookies = { httpOnly: true, secure: true };
    return res.status(200).clearCookie("refreshToken", optionForSequreCookies).clearCookie("accessToken", optionForSequreCookies).json(new ApiResponse(200, {}, "User Logged Out"))
})

export const refreshTokenAgainGeneratedAccess = asyncHandler(async (req, res) => {
    //if accessToken Session Expire in that case via refresh token regenerated access without login if userRefreshToken === existedUserSavedInDataBaseRefreshToken....>>>>>>
    const comingFromUserSideRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!comingFromUserSideRefreshToken) { throw new ApiError(404, "Authentication Failed") };
    try {
        const decodedToken = jwt.verify(comingFromUserSideRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decodedToken) { throw new ApiError(402, "Your Token is Not Valid") };
        const user = await User.findById(decodedToken?._id);
        if (user?.refreshToken !== comingFromUserSideRefreshToken) { throw new ApiError(403, "Your RefreshToken is Expired or Invalid") };
        const { accessToken, newRefreshToken } = await getAccessTokenAndRefreshToken(user?._id);

        const optionForSequreCookies = { httpOnly: true, secure: true };
        return res.status(200).cookie("refreshToken", newRefreshToken, optionForSequreCookies).cookie("accessToken", accessToken, optionForSequreCookies).json(new ApiResponse(200, { user, accessToken, newRefreshToken }, "New Session start again"))

    } catch (error) {
        throw new ApiError(404, "Invalid Token")
    }

})

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) { throw new ApiError(401, "your Account is LoggedOut Login First") };
    const passwordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!passwordCorrect) { throw new ApiError(403, "Wrong Password") };
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, "Password changed SuccessFully"));
})

export const changeAvatar = asyncHandler(async (req, res) => {
    //missing one thing Delete old Avatar Data..
    try {
        const avatarLocalPath = req.file?.path;
        if (!avatarLocalPath) { throw new ApiError(404, "avatar Not Available") };
        const avatarUploded = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarUploded) { throw new ApiError(404, "Error Occurs While Uploading avatar in Cloudinary") }
        const user = await User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatarUploded.url } }, { new: true }).select("-password");
        if (!user) { throw new ApiError(404, "Logged Out User Error Occurs While uploading avatar") };
        return res.status(200).json(new ApiResponse(201, { user }, "avatar Changed SuccessFuliy"))
    } catch (error) {
        throw new ApiError(405, "Error Occurs While Changing avatar")
    }
})

export const changeCoverImage = asyncHandler(async (req, res) => {
    try {
        const coverImageLocalPath = req.file?.path;
        if (!coverImageLocalPath) { throw new ApiError(404, "CoverImage Not Available") };
        const coverImageUploded = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImageUploded) { throw new ApiError(404, "Error Occurs While Uploading Cover Image in Cloudinary") }
        const user = await User.findByIdAndUpdate(req.user._id, { $set: { coverImage: coverImageUploded.url } }, { new: true }).select("-password");
        if (!user) { throw new ApiError(404, "Logged Out User Error Occurs While uploading CoverImage") };
        return res.status(200).json(new ApiResponse(201, { user }, "CoverImage Changed SuccessFuliy"))
    } catch (error) {
        throw new ApiError(405, "Error Occurs While Changing CoverImage")
    }
})

export const updateUserDetails = asyncHandler(async (req, res) => {
    try {
        const { fullName, email } = req.body;
        if (!fullName || !email) { throw new ApiError(402, "Required field for Updation Fullname And Email") };
        const user = await User.findByIdAndUpdate(req.body._id, { $set: { email, fullName } }, { new: true }).select("-password");
        if (!user) { throw new ApiError(400, "Error in the Process of updating Data") };
        return res.status(200).json(new ApiResponse(200, { user }, "Updating Details Successfully"))
    } catch (error) {
        throw new ApiError(405, "updating Details Error")
    }
})

export const currentUser = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, { user: req.user }, "Current User"));
    } catch (error) {
        throw new ApiError(405, "Logged Out User");
    }
})

export const userprofile = asyncHandler(async (req, res) => {
    try {
        const myProfile = await User.findById(req.user._id).populate("posts");
        return res.status(200).json(new ApiResponse(200, myProfile, "Here Is my Profile"));
    } catch (error) {
        throw new ApiError(405, "Logged Out User");
    }
});

export const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const myProfile = await User.findById(req.params.id).populate("posts");
        return res.status(200).json(new ApiResponse(200, myProfile, "Here Is Get my Profile"));
    } catch (error) {
        throw new ApiError(405, "Logged Out User");
    }
});
export const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const allUsers = await User.find({});
        return res.status(200).json(new ApiResponse(200, allUsers, "All Users fetched"));
    } catch (error) {
        throw new ApiError(405, "Logged Out User");
    }
});

export const followOrUnfollow = asyncHandler(async (req, res) => {
    try {
        const followedByUser = await User.findById(req.params.id);
        const user = await User.findById(req.user._id);
        if (!followedByUser) throw new ApiError(404, "User Not found");
        if (user.following.includes(followedByUser._id)) {
            const userIndex = user.following.indexOf(followedByUser._id);
            const followedByUserIndex = followedByUser.follower.indexOf(user._id);

            user.following.splice(userIndex, 1);
            followedByUser.following.splice(followedByUserIndex, 1);

            await user.save();
            await followedByUser.save();
            return res.status(200).json(ApiResponse(200, "User Unfollow Successfully"))
        }
        user.following.push(followedByUser._id);
        followedByUser.follower.push(user._id);
        await user.save();
        await followedByUser.save();
        return res.status(200).json(ApiResponse(200, "User followed Successfully"))
    } catch (error) {
        throw new ApiError(500, "Internal Server Error In Following")
    }
});
