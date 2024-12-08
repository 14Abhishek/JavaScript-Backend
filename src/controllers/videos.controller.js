import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Video } from "../models/video.models";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";
import { Jwt } from "jsonwebtoken";


const publishVideo = await asyncHandler((req, res)=>{
    // is the user logged in?--routes
    // take the fields on video
    // take video ..upload on cloudinary ..store the link 
    // return video
    const {title, description} = req.body

    const videoLocalPath = req.files?.avatar[0]?.path
})

const getAllVideos = await asyncHandler((req, res)=>{

})


const getVideoById = await asyncHandler((req, res)=>{

})


const updateVideo = await asyncHandler((req, res)=>{

})


const publishStatus = await asyncHandler((req, res)=>{

})


const deleteVideo = await asyncHandler((req, res)=>{

})





export {
    publishVideo
}