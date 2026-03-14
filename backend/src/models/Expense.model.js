import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    enum: [
      "food",
      "travel",
      "shopping",
      "bills",
      "entertainment",
      "education",
      "health",
      "other"
    ],
    default: "other"
  },

  notes: {
    type: String
  },

  date: {
    type: Date,
    default: Date.now
  }

},
{ timestamps: true }
);

expenseSchema.index({user:1})
expenseSchema.index({category:1})
expenseSchema.index({createdAt:-1})

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;