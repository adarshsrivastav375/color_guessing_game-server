import { Router } from "express";
import {
  registerAdmin,
  adminLogin,
  logoutadmin,
  refreshAccessTokenAdmin,
  changePasswordAdmin,
  updateAdminDetails,
  getCurrentUser,
} from "../controllers/adminController.js";
import { verifyJWT } from "../middlewere/auth.middlewere.js";
const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(adminLogin);
router.route("/logout").post(verifyJWT, logoutadmin);
router.route("/refresh-token").post(refreshAccessTokenAdmin);
router.route("/change-password").post(verifyJWT, changePasswordAdmin);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAdminDetails);

export default router;
