import mongoose from "mongoose";

const OVERALL_BUDGET_CATEGORY = "overall";

const budgetSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  category: {
    type: String,
    enum: [
      OVERALL_BUDGET_CATEGORY,
      "food",
      "travel",
      "shopping",
      "bills",
      "entertainment",
      "education",
      "health",
      "other"
    ],
    default: OVERALL_BUDGET_CATEGORY
  },

  budgetAmount: {
    type: Number,
    required: true
  },

  amount: {
    type: Number
  },

  month: {
    type: String,
    required: true
  }

},
{
  timestamps: true
}
);

budgetSchema.pre("validate", function syncBudgetAmount(next) {
  const normalizedAmount = Number(this.budgetAmount ?? this.amount ?? 0);
  this.budgetAmount = normalizedAmount;
  this.amount = normalizedAmount;
  this.category = String(this.category || OVERALL_BUDGET_CATEGORY).toLowerCase();
  next();
});

budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
