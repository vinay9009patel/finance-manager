import Badge from "../models/Badge.model.js";

export const checkBadges = async (userId, streak) => {
  const ensureBadge = async (badgeName, description) => {
    const existing = await Badge.findOne({
      user: userId,
      badgeName
    });

    if (existing) {
      return existing;
    }

    return Badge.create({
      user: userId,
      badgeName,
      description
    });
  };

  if (streak === 3) {
    await ensureBadge("Bronze Saver", "Saved money for 3 days");

  }

  if (streak === 7) {
    await ensureBadge("Silver Saver", "Saved money for 7 days");

  }

  if (streak === 30) {
    await ensureBadge("Gold Saver", "Saved money for 30 days");

  }

};
