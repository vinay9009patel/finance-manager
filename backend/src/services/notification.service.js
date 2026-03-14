import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";
import { io } from "../../server.js";

export const createNotification = async (userId, type, message) => {
  const notification = await Notification.create({
    user: userId,
    type,
    message
  });

  io.to(`user_${userId}`).emit("new_notification", notification);

  return notification;
};

export const createLinkedNotification = async ({
  actorUserId,
  type,
  actorMessage,
  parentMessage
}) => {
  const actorNotification = await createNotification(actorUserId, type, actorMessage);

  const actor = await User.findById(actorUserId).select("linkedParent");
  if (actor?.linkedParent && parentMessage) {
    await createNotification(actor.linkedParent, type, parentMessage);
  }

  return actorNotification;
};
