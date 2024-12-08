import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connected !! DB_HOST: ${connectionInstance.connection.host}` )
    } catch (err) {
        console.error(err.message)
        console.log("we have some db connection error")
    }
}

export default connectDB