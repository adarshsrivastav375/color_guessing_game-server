import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userControllers.js";
import { verifyJWT } from "../middlewere/auth.middlewere.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
