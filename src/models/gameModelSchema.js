import mongoose, { Schema } from "mongoose";
import AggregatePaginate from "mongoose-aggregate-paginate-v2";

const gameSchema = new Schema(
  {
    enrolledUser: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    gameType: {
      type: String,
      enum: ["Parity", "Sapre", "Bcone", "Emred"],
      default: "Parity",
    },
    result: {
      type: Object,
    },

    TotalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

gameSchema.plugin(AggregatePaginate);

export const Game = mongoose.model("Game", gameSchema);
