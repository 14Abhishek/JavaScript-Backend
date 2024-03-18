import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

// like how express 'app' is made
const router = Router();


router.route("/register").post(registerUser)
 
export default router;  