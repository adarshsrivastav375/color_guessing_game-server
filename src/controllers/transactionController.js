import { Transaction } from "../models/transactionModel.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";

//new transaction
const newTransaction = asyncHandler(async (req, res) => {
  const { amount, type, transactionId } = req.body;
  const userId = req.user?._id;
  if ([amount, type].some((field) => field === "")) {
    throw new ApiError(400, "please enter amount");
  }
  const transaction = await Transaction.create({
    userId,
    amount,
    type,
    transactionId,
    status: "processing",
  });
  if (!transaction) {
    throw new ApiError(500, "Something went wrong initialize transaction");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, transaction, "processed successfully"));
});

//for admin
const findPresseingTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    status: "processing",
  });
  if (!transactions) {
    throw new ApiError(404, "No processing transaction found");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, transactions, "here is all pending transactions")
    );
});

const approveTransaction = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    status: "processing",
  });
  if (!transactions) {
    throw new ApiError(404, "No processing transaction found");
  }
  const { _id, userId, type, amount } = req.body;
  if ([_id, userId, type, amount].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "No user found");
  }
  if (type == "deposit") {
    user.walletBalance += amount;
  } else if (type == "withdraw") {
    user.walletBalance -= amount;
  }
  await user.save();
  const updatedTransaction = Transaction.findByIdAndUpdate(
    _id,
    { status: "accepted" },
    { new: true }
  );
  return res
    .status(201)
    .json(new ApiResponse(200, updatedTransaction, "transaction Accepted"));
});
//find users transactions
const usersTransctions = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const transactions = await Transaction.find({
    userId: userId,
  });
  if (!transactions) {
    throw new ApiError(404, "No transactions found");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, transactions, "here is all transactions")
    );
});

export {
  newTransaction,
  approveTransaction,
  findPresseingTransactions,
  usersTransctions,
};
