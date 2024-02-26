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

const updateIntervals = {
  Parity: 60000, 
  Sapre: 120000,
  Bcone: 180000,
  Emred: 240000, 
};
transactionSchema.plugin(AggregatePaginate);

gameSchema.methods.updateResult = function () {
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
 this.result = {
   [keyToUpdate]: colorToUpdate,
 };
};


gameSchema.plugin(function (schema, options) {
    schema.pre("save", function (next) {
       const updateInterval =
         updateIntervals[this.gameType] || updateIntervals["Parity"];
    if (!this.result) {
      this.result = {
          result: "result is being calculated"
      };
    }
    setTimeout(() => {
      this.updateResult();
      next();
    }, updateInterval);
  });
});

export const Game = mongoose.model("Game", gameSchema);
