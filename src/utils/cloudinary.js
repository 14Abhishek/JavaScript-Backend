import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
// fs here is filesystem


           
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});



// we recive localfile path from server and the method uploads them to cloudinary
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        // if localFilePath is legit..upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        

 
        //file has been uploaded at this point
        // console.log('The file has been uploaded on cloudinary', response.url)
        fs.unlinkSync(localFilePath)  // removes locally saved file if upload operation success
        return response;
    } catch (err) {
        fs.unlinkSync(localFilePath) // remove the locally saved temprary 
        //  file as the upload operation got failed
        return null;
    }
}


// delte from cloudinary 
const deleteOnCloudinary = async ()=>{
    try {
        const response = await cloudinary.uploader.destroy()
    } catch (err) {
        console.error(err.message)
    }
}


 
// files we will get from filesysttem..uploaded from server
// we will get local file path(file on server)
// we put that  file on cloudinary

// when file uploaded we don't need it on our server so we gotta remove 
// as well



export {uploadOnCloudinary} 