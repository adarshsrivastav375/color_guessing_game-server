import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewere.js";
import gameController from "../controllers/gameController.js";

const router = Router();

router.get('/', verifyJWT, gameController.getCurrentActiveGame);
router.get('/bet', verifyJWT, gameController.getBets);
router.get('/contast', verifyJWT, gameController.getContasts);
router.post('/', verifyJWT, gameController.gameUserChoice);

export default router;
