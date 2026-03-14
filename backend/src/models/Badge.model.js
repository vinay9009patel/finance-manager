import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  badgeName: {
    type: String,
    required: true
  },

  description: {
    type: String
  }

}, { timestamps: true });

badgeSchema.index({ user: 1, badgeName: 1 }, { unique: true });

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
