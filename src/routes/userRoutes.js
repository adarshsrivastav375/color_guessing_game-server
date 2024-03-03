import { Router } from "express";
import { usersTransctions } from "../controllers/transactionController.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  addBankDetails,
} from "../controllers/userControllers.js";
import { verifyJWT } from "../middlewere/auth.middlewere.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/add-bank-details").post(verifyJWT, addBankDetails);
router.route("/transactions").get(verifyJWT, usersTransctions);

export default router;
