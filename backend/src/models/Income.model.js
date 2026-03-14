import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    source: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    notes: {
      type: String
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Income = mongoose.model("Income", incomeSchema);

export default Income;