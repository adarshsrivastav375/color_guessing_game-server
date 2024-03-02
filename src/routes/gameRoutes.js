import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewere.js";
import gameController from "../controllers/gameController.js";

const router = Router();

router.get('/', gameController.getCurrentActiveGame);
router.get('/bet', gameController.getBets);
router.get('/contast', gameController.getContasts);
router.post('/', gameController.gameUserChoice);

export default router;
