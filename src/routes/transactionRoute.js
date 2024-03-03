import {
  newTransaction,
  approveTransaction,
  findPresseingTransactions,
} from "../controllers/transactionController.js";
import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewere.js";

const router = Router();

router.route("/").post(verifyJWT, newTransaction);
router.route("/get-pending-transaction").get(verifyJWT, approveTransaction);
router.route("/aproove-transaction").post(verifyJWT, findPresseingTransactions);
export default router;
