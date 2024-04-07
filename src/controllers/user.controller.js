import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { signedCookie } from "cookie-parser";


const generateAccessAndRefreshToken = async (uid)=>{
    try {
        const user = await User.findOne({uid})
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken(); 

        user.refreshToken = refreshToken;
        user.accessToken = accessToken;

        await user.save({validateBeforeSave: false}); 
        return {accessToken, refreshToken}
    } catch (err) {
        throw new ApiError(500, "Something went wrong in generating access nd  refresh token")
    }
}


const registerUser = asyncHandler(async (req, res)=>{
     // get imp details from user
     // validation (eg. not empty)
     // if user already exists: usrsname, email
     // check images, avatar
     // upload on cloudinary
     // create user object- entry in db
     // remove password and refresh token from response
     // check for user creation 
     // return response


     
     const {fullName, email, username, password} = req.body;
  
    if([fullName, email, username, password].some(field=>field?.trim() === "")){
        throw new ApiError(400, `The ${field} is required field`)
    } // we can check other validation as well like ..@ is present in email field 

    const existedUser = await User.findOne({
        $or: [{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409, "The User already Exists")
    }

    
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file  is required")
    }

    const avatarUpload = await uploadOnCloudinary(avatarLocalPath)
    const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatarUpload){
        throw new ApiError(400, "Avatar file, not uploaded on cloudinary")
    }

    const user = await User.create({
        fullName,
        avatar: avatarUpload.url,
        coverImage: coverImageUpload?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "registering user went wrong (cant find in db)")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res)=>{
    // get data from req.body
    // username 
    // find user
    // password check
    // access token and refresh token
    // send cookie

    const {username, password, email} = req.body

    if(!username && !email){
        throw new ApiError(400, "Please enter the username/email correctly");
    }

    const user = await User.findOne({
        $or : [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user does not exist");
    }

    const isCorrectValid = await user.isPasswordCorrect(password);
    if(!isCorrectValid){
        throw new ApiError(401, "Invalid password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken");
    
    const options =  {
        httpOnly: true,      // cookie only accessable fron server side js
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, 
            {user: loggedInUser, accessToken, refreshToken}, 
            "User logged in Successfully")
    )

})


const logoutUser = asyncHandler(async(req, res)=>{
    
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        }
        )
    
    const options =  {
        httpOnly: true,  // cookie only accessable fron server side js
        secure: true
    }

    return res
    .status(200)
    .clearCookie(refreshToken, options)
    .clearCookie(accessToken, options)
    .json(
        new ApiResponse(200, {}, "User logged Out")
    )
    

})

export {
    registerUser, 
    loginUser, 
    logoutUser
}