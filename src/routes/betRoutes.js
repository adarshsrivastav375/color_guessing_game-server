import { Router } from "express";
import { joinBet } from "../controllers/betController.js";
import { verifyJWT } from "../middlewere/auth.middlewere.js";

const router = Router();

router.route("/join-bet").post(verifyJWT, joinBet);

export default router;
