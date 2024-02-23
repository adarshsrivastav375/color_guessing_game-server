import mongoose, { Schema } from "mongoose";
import AggregatePagenate from "mongoose-aggregate-paginate-v2";

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "bet"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
transactionSchema.plugin(AggregatePagenate);
export const Transaction = mongoose.model("Transaction", userSchema);
