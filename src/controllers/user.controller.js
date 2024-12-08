import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  {User}  from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { signedCookie } from "cookie-parser";
import  jwt  from "jsonwebtoken";
import { response } from "express";
import mongoose from "mongoose"



const generateAccessAndRefreshToken = async (uid)=>{
    try {
        const user = await User.findById(uid)
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

    const isCorrectValid = await User.isPasswordCorrect(password);
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
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(
        new ApiResponse(200, {}, "User logged Out")
    )
    

})


const renewAccessAndRefreshToken = asyncHandler(async(req,res)=>{

    // getting id from incoming cookies
    // decoding the token
    // Is the refresh token expired? -> getting refreshtoken from db, then comparing it with incoming token
    // generating tokens from external method


    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Token not found in cookies")
    }
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if(!decodedToken){
        throw new ApiError(401, "Invalid Token(not able to decode/verify token)")
    }

    const user = User.findById(decodedToken._id)
    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError(401, "Refresh Token is expired coz, token from db is diff")
    }

    const {refreshToken, accessToken} = await generateAccessAndRefreshToken(decodedToken._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,{accessToken, refreshToken}, "Tokens renewed successfully" )
    )


})


const changeCurrentPassword = asyncHandler(async(req, res)=>{
    // get pswrd from req, and fetch user from db
    // check if old password correct
    // save new password in db (it automatically bcrypts)
    // return response

    const {password, newPassword} = req.body;

    const user = await User.findById(req.user?._id);


    const isPassCorrect = await user.isPasswordCorrect(password)
    if(!isPassCorrect){
        throw new ApiError(400, "password is incorrect")
    } 

    user.password = newPassword;
    await user.save({validateBeforeSave: false}); 

    // what if i want to hit an endpoint here? ... example-> logout
    // eg. logout user after he resets password

    return res
    .status(200)
    .json(
        new ApiResponse(200, _, "The password is reset successfully")
    )
    
})


const getCurrentUser = asyncHandler(async(req, res)=>{  
    return res
    .status(200)
    .json(
        new ApiResponse(200, req?.user, "The current User Fetched") 
    )
})


// we don't update files in this controller... for that we set a seperate endpoint
const updateAccountDetails = asyncHandler(async(req, res)=>{
    // take data
    // validatoin of fields
    // find user
    
    const {username, fullName, email} = req.body
    
    if(!username || !fullName || !email){
        throw new ApiError(400,"Entered value is invalid or empty")
    }

    const user  = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email,
                username: username
            }
        },
        {new: true}     // after updating the info returns object
        ).select("-password");   // returned object must not contain this field

    return res
    .status(200, user, "User details updated successfully")

})

const updateUserAvatar = asyncHandler(async(req, res)=>{
    // here we will have access to req.file as we will be using the multer middleware
    // we had req.files coz we had 2 imgfiles 

    // here multer uploaded file locally
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
    }
    
    // TODO: delete old image

    // delet    e image from cloudinary
    const avatar = uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(500, "Error while uplaoding on avatar")
    }   

    const user = User.findByIdAndDelete(
        req.user?._id,
        {$set: {avatar: avatar.url}},
        {new: true} //infor recived after update
    ).select("-password")   

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "The avatar was updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
    //when we need a channel profile we visit its url
    const {username} = req.params;
    if(!username?.trim()){
        throw new ApiError(400, "The username entered is invalid")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField:"channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscription",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                subscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }  
                    
                }     
            }
        },
        {
            $project:{
                fullName: 1,
                subscriberCount: 1,
                subscriberCount:1,
                isSubscribed: 1,
                username: 1,
                avatar: 1,
                coverImage:1,
                email: 1
            }
        }
    ])

    // this channel thing which is implementing 'aggregate' 
    // returns array of objects .. those objects are the ones that
    // match our specifications mentioned ... here in our controller
    // we just specified that return the document which has the mentioned 
    // username.... so that will be just one document
    if(!channel.length){
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel Fetched"))
})


const getWatchHistory = asyncHandler(async(req, res)=>{
    // note that req.user._id returns a String .. and that string is resolved by 
    // mongoose so that it can be converted into appropriate id.... but when we use
    // aggregate method the whole code goes to mongodb so we have to manually resolve 
    // it and then send id to mongodb... 


    // another imp thing ... when we left join the video schema to the 
    // user watchHistory .. there is another field in video schema which
    // will be empty and that is 'owner'... so if we need the owner we need
    // to make another aggregation ... so basically aggregation within aggregation 
    
    const user = await User.aggregate([
        {
            $match: {
                _id:  new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField: "_id",
                            as: "owners",
                            pipeline: [
                               {
                                $project:{
                                    username: 1,
                                    fullName: 1
                                }
                               }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "watchHistory fetched"))
})

export {
    registerUser, 
    loginUser, 
    logoutUser,
    renewAccessAndRefreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory
}