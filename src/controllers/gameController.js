import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/gameModelSchema.js";
import { User } from "../models/userModel.js";
import { Bet } from "../models/betModel.js";
import cron from "node-cron";
import dayjs from "dayjs";
import mongoose from "mongoose";

// cron.schedule("*/5 * * * * *", async () => {
//   await generateGame("Parity", 5);
// });
cron.schedule("*/1 * * * *", async () => {
  await generateGame("Parity", 1);
});
cron.schedule("*/7 * * * *", async () => {
  await generateGame("Sapre", 7);
});
cron.schedule("*/9 * * * *", async () => {
  await generateGame("Bcone", 9);
});
cron.schedule("*/15 * * * *", async () => {
  await generateGame("Emred", 15);
});



const generateGame = async (gameType, minutesToAdd) => {
  try {
    await UpdateGame(gameType);
    const currentDate = dayjs();

    // Add minutesToAdd to the current date
    const newDate = currentDate.add(minutesToAdd, 'minute');

    await Game.create({
      gameType,
      status: "ongoing",
      expiredAt: newDate
    });

    console.log("New Game Generated!")
  } catch (error) {
    console.log("error:", error);
  }
};

const UpdateGame = async (gameType) => {
  try {
    const game = await Game.findOne({ gameType, status: "ongoing" });
    if (!game) {
      return;
    }
    if (game.status === "completed") {
      return;
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

    await Game.updateOne({ _id: game._id }, { result: result, status: "completed" });
    await updateBetResultsAndRewards(game._id, colorToUpdate);
  } catch (error) {
    console.log("error:", error);
  }
};

const updateBetResultsAndRewards = async (gameId, gameResult) => {
  try {
    const bets = await Bet.find({ gameId });
    if (!bets) {
      throw new ApiError(404, "No bet found");
    }
    for (const bet of bets) {
      if (bet.choosedColor === gameResult) {
        bet.result = "win";
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(bet.userId) });
        user.walletBalance += (parseInt(bet.betAmount) * 2);
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

const getCurrentActiveGame = asyncHandler(async (req, res) => {
  const game = await Game.findOne({ status: "ongoing", gameType: req.query.gameType })
  res.status(201).json(new ApiResponse(200, game));
});

const gameUserChoice = asyncHandler(async (req, res) => {
  const { body } = req;
  await Bet.create({
    gameId: body.gameId,
    userId: body.userId,
    betAmount: parseInt(body.amount),
    choosedColor: body.color,
  })

  res.status(201).json(new ApiResponse(201, 'saved'));
});

const getBets = asyncHandler(async (req, res) => {
  const { pageNumber, limit, id } = req.query;
  const query = { userId: id };
  const totalCouponsCount = await Bet.countDocuments(query);

  const totalPages = Math.ceil(parseInt(totalCouponsCount) / parseInt(parseInt(limit)));

  const bets = await Bet.find(query).sort({ _id: -1 }).skip((parseInt(pageNumber) - 1) * parseInt(limit)).limit(parseInt(limit));
  const pagination = generatePagination(totalPages, parseInt(pageNumber))
  res.status(201).json(new ApiResponse(200, { bets, pagination }));
});

const getContasts = asyncHandler(async (req, res) => {
  const { pageNumber, limit, gameType } = req.query;
  const query = { gameType };
  const totalCouponsCount = await Game.countDocuments(query);

  const totalPages = Math.ceil(parseInt(totalCouponsCount) / parseInt(parseInt(limit)));

  const contasts = await Game.find(query).sort({ _id: -1 }).skip((parseInt(pageNumber) - 1) * parseInt(limit)).limit(parseInt(limit));
  const pagination = generatePagination(totalPages, parseInt(pageNumber))
  res.status(201).json(new ApiResponse(200, { contasts, pagination }));
});


function generatePagination(totalPages, currentPage) {
  const pagination = [];
  const maxVisiblePages = 4;

  // Function to add page number to pagination array
  const addPage = (pageNumber) => pagination.push(pageNumber);

  // Add 'first' and 'previous' links
  if (currentPage > 1) {
    addPage(currentPage - 1); // 'previous'
  }

  // Calculate range of visible pages
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages);

  // Adjust startPage and endPage to ensure maxVisiblePages are displayed
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }



  for (let i = startPage; i <= endPage; i++) {
    addPage(i);
  }


  // Add 'next' and 'last' links
  if (currentPage < totalPages) {
    addPage(currentPage + 1); // 'next'
  }

  return pagination;
}


export default { getCurrentActiveGame, gameUserChoice, getBets, getContasts };
