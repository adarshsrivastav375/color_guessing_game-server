import mongoose, { Schema } from "mongoose";
import { Game } from "./gameModelSchema.js";

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
    betAmout: {
      type: Number,
      required: true,
    },
    choosedColor: {
      type: String,
      enum: ["red", "green", "yellow"],
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
      const game = await Game.findById(this.gameId);
      game.enrolledUser += 1;
      game.TotalAmount += this.betAmount;
      await game.save();
      next();
    } catch (error) {
      next(error);
    }
  });
});

export const Bet = mongoose.model("Bet", betSchema);
