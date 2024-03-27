import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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


    const {fullNmame, email, username, password} = req.body;
    console.log("email: ", email) 

    if([fullNmame, email, username, password].some(field=>field?.trim() === "")){
        throw new ApiError(400, `The ${field} is required field`)
    } // we can check other validation as well like ..@ is present in email field 

    const existedUser = User.findOne({
        $or: [{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409, "The User already Exists")
    }

    // console.log(req.files)
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
        fullNmame,
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


export {registerUser}