import Income from "../models/Income.model.js";
import { createLinkedNotification } from "../services/notification.service.js";
import { incomeValidator } from "../utils/validator.js";

export const addIncome = async (req, res) => {

  try {
    const { error } = incomeValidator.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const { source, amount, notes } = req.body;

    const income = await Income.create({
      user: req.user._id,
      source,
      amount,
      notes
    });

    await createLinkedNotification({
      actorUserId: req.user._id,
      type: "income",
      actorMessage: `Income added: Rs.${amount} from ${source}`,
      parentMessage: `${req.user.name || "Student"} added income of Rs.${amount} from ${source}`
    });

    res.status(201).json({
      message: "Income added",
      income
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

export const getIncomes = async (req, res) => {

  try {

    const incomes = await Income.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json(incomes);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};
