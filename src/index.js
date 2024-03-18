import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import {app} from "./app.js"
  

dotenv.config({
    path: './env'
})




connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port ${process.env.PORT}`)
    })
} )
.catch(err=>console.error(err.message + '\n Mongodob conect error'))








/*
// import express from "express"
// const app  = express();
;(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       app.listen(process.env.PORT, ()=> console.log("We listening to it"));
    } catch (err) {
        console.error(err.message)
    }
})()

*/