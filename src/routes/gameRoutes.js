import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewere.js";
import { createNewGame } from "../controllers/gameController.js";

const router = Router();

router.route("/new-game").post(verifyJWT, createNewGame);

export default router;
