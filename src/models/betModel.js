import mongoose, { Schema } from "mongoose";
import { Game } from "./gameModelSchema.js";
import { User } from "./userModel.js";

const betSchema = new Schema(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    betAmount: {
      type: Number,
      required: true,
    },
    choosedColor: {
      type: String,
      enum: ["red", "green", "blue"],
      required: true,
    },
    result: {
      type: String,
      enum: ["win", "lose"],
    },
  },
  {
    timestamps: true,
  }
);
betSchema.plugin(function (schema, options) {
  schema.pre("save", async function (next) {
    try {
      // Check if the document is new
      if (this.isNew) {
        const game = await Game.findById(this.gameId);
        const user = await User.findOne({ _id: this.userId });

        if (!game || !user) {
          throw new Error("Related game or user not found");
        }

        game.enrolledUser += 1;
        game.TotalAmount += this.betAmount;
        user.walletBalance -= this.betAmount;

        await user.save();
        await game.save();
      }
      next();
    } catch (error) {
      next(error);
    }
  });
});

export const Bet = mongoose.model("Bet", betSchema);
