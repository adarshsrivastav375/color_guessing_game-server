import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/gameModelSchema.js";
import { User } from "../models/userModel.js";
import { Bet } from "../models/betModel.js";
import cron from "node-cron";

cron.schedule("01 * * * * *", () => {
  console.log("running a task every minute");
});


const generateGame = asyncHandler(async(gameType) => {
  await Game.create({
    gameType,
    status: "ongoing"
  });
});

const createNewGame = asyncHandler(async (req, res) => {
  const { gameType } = req.body;
  const createGame = await Game.create({
    gameType,
  });
  const createdGame = await Game.findByIdAndUpdate(
    createGame._id,
    {
      $set: {
        status: "ongoing",
      },
    },
    { new: true }
  );
  if (!createdGame) {
    throw new ApiError(500, "Something went wrong while registering the Game");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdGame, "game created successfully"));

  UpdateGame(createGame._id);
});
const UpdateGame = asyncHandler(async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new ApiError(404, "No game found");
  }
  if (game.status === "completed") {
    throw new ApiError(400, "Game expired");
  }

  const resultObject = {
    0: "green",
    1: "red",
    2: "blue",
    3: "green",
    4: "red",
    5: "blue",
    6: "green",
    7: "red",
    8: "blue",
    9: "green",
  };
  const keys = Object.keys(resultObject);
  const randomKeyIndex = Math.floor(Math.random() * keys.length);
  const keyToUpdate = keys[randomKeyIndex];
  const colorToUpdate = resultObject[keyToUpdate];
  const result = {
    [keyToUpdate]: colorToUpdate,
  };
  const updateIntervals = {
    Parity: 30000,
    Sapre: 120000,
    Bcone: 180000,
    Emred: 240000,
  };
  const updateInterval =
    updateIntervals[game.gameType] || updateIntervals["Parity"];
  setTimeout(async () => {
    game.result = result;
    game.status = "completed";
    await game.save({ validateBeforeSave: false });
    updateBetResultsAndRewards(gameId, colorToUpdate);
  }, updateInterval);
});
const updateBetResultsAndRewards = async (gameId, gameResult) => {
  try {
    const bets = await Bet.find({ gameId });
    if (!bets) {
      throw new ApiError(404, "No bet found");
    }
    for (const bet of bets) {
      if (bet.choosedColor === gameResult) {
        bet.result = "win";
        const user = await User.findById(bet.userId);
        user.walletBalance += bet.betAmout * 2;
        await user.save();
      } else {
        bet.result = "lose";
      }
      await bet.save();
    }
  } catch (error) {
    console.error("Error updating bet results and rewards:", error);
    throw error;
  }
};
export { createNewGame };
