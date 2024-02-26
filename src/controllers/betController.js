import { Bet } from "../models/betModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";

const joinBet = asyncHandler(async (req, res) => {
    const { gameId, betAmout, choosedColor } = req.body;
    const userId = req.user?._id;
  if ([gameId, betAmout, choosedColor].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }
    if (betAmout % 10 !== 0) {
       throw new ApiError(400, "amount should be in multiple of 10");
  }
    const user = await User.findById(userId);
    if (user.walletBalance < betAmout) {
        throw new ApiError(400, "Please recharge your acoount");
    }
    const newBet = await Bet.create({
      gameId,
      userId,
      betAmout,
      choosedColor,
    });
    user.walletBalance -= betAmout;

    await user.save({ validateBeforeSave: false });
     return res
       .status(201)
       .json(new ApiResponse(200, newBet, "bet joined  successfully"));
});
export { joinBet };