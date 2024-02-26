import { newTransaction, approveTransaction } from "../controllers/transactionController";
import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewere.js";

const router = Router();

router.route("/transaction").post(verifyJWT, newTransaction);
router.route("/get-pending-transaction").post(verifyJWT, approveTransaction);
router.route("/aproove-transaction").post(verifyJWT, findPresseingTransactions);
