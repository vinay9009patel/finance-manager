import Joi from "joi";

export const registerValidator = Joi.object({

  name: Joi.string()
    .min(3)
    .max(30)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .required(),

  role: Joi.string()
    .valid("student", "adult", "child", "parent", "user", "admin")
    .optional(),

  isParent: Joi.boolean()
    .optional(),

  gender: Joi.string()
    .valid("male", "female", "other")
    .optional(),

  profileImage: Joi.string()
    .allow("")
    .optional()

});

export const loginValidator = Joi.object({

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required()

});

export const expenseValidator = Joi.object({

  title: Joi.string()
    .min(2)
    .max(50)
    .required(),

  amount: Joi.number()
    .positive()
    .required(),

  category: Joi.string()
    .required(),

  notes: Joi.string()
    .allow("")
});

export const incomeValidator = Joi.object({

  source: Joi.string()
    .min(2)
    .required(),

  amount: Joi.number()
    .positive()
    .required(),

  notes: Joi.string()
    .allow("")
});

export const budgetValidator = Joi.object({

  amount: Joi.number()
    .positive()
    .optional(),

  budgetAmount: Joi.number()
    .positive()
    .optional(),

  category: Joi.string()
    .valid(
      "overall",
      "food",
      "travel",
      "shopping",
      "bills",
      "entertainment",
      "education",
      "health",
      "other"
    )
    .optional(),

  month: Joi.string()
    .required()

}).custom((value, helpers) => {
  if (!value.amount && !value.budgetAmount) {
    return helpers.error("any.invalid");
  }

  return value;
}, "budget amount validation").messages({
  "any.invalid": "\"amount\" is required"
});
