import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    renewAccessAndRefreshToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
    }
 from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/Auth.middleware.js";

// like how express 'app' is made
const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)
 

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(renewAccessAndRefreshToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").post(verifyJWT, updateAccountDetails)

router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar)



export default router;  