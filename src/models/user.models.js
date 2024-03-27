import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage:{
            type: String,
        },
        watchHistory:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }




    }, {timestamps: true}
)



            //hash pasword
// direct encyption of password is not possible
// so we use hooks given by mongoose..like the Pre hook
// which performs operations to data just before any operation.
// So use Pre hook just before "save"...we don't make arraw function
// coz it does not have 'this' reference and it takes time so-> async
// and because its a middleware...we use 'next'
userSchema.pre("save", async function(next){
    // we want this function to execute only when password is saved
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})




// method to check if password entered by user is correct
userSchema.methods.isPasswordCorrect = async function (pswrd){
   return await bcrypt.compare(pswrd, this.password)
}





// jwt is a bearer token(google)...we have generated vairous tokens in env file
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}






export const User = mongoose.model("User", userSchema)