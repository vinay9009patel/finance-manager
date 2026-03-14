import User from "../models/User.model.js";

export const updateSavingStreak = async (userId, income, expense) => {

  const user = await User.findById(userId);

  const today = new Date().toDateString();

  if (income > expense) {

    const lastDate = user.lastSavingDate
      ? new Date(user.lastSavingDate).toDateString()
      : null;

    if (lastDate !== today) {

      user.streak += 1;
      user.lastSavingDate = new Date();

      await user.save();
    }

  } else {

    user.streak = 0;
    await user.save();

  }

  return user.streak;

};