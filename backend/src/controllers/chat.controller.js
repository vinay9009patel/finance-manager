import { getAIAdvice } from "../services/ai.service.js";
import Chat from "../models/Chat.model.js";
import { createLinkedNotification } from "../services/notification.service.js";

export const chatWithAI = async (req, res) => {

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    const prompt = `
You are a financial assistant.

User question:
${message}

Give helpful financial advice.
`;

    const reply = await getAIAdvice(prompt);

    await Chat.create({
      user: req.user._id,
      userMessage: message,
      aiReply: reply
    });

    await createLinkedNotification({
      actorUserId: req.user._id,
      type: "ai",
      actorMessage: `AI advice received: ${reply.slice(0, 80)}`,
      parentMessage: `${req.user.name || "Student"} received new AI advice`
    });

    res.json({
      userMessage: message,
      aiReply: reply
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};
export const getChatHistory = async (req, res) => {

  try {

    const chats = await Chat.find({
      user: req.user._id
    }).sort({ createdAt: 1 });

    res.json(chats);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};
