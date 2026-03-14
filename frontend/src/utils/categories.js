export const EXPENSE_CATEGORIES = [
  "food",
  "travel",
  "shopping",
  "bills",
  "entertainment",
  "education",
  "health",
  "other"
];

export const CATEGORY_META = {
  food: { label: "Food", icon: "F" },
  travel: { label: "Travel", icon: "T" },
  shopping: { label: "Shopping", icon: "S" },
  bills: { label: "Bills", icon: "B" },
  entertainment: { label: "Fun", icon: "E" },
  education: { label: "Edu", icon: "D" },
  health: { label: "Health", icon: "H" },
  other: { label: "Other", icon: "O" }
};

export const formatCategoryLabel = (category = "other") =>
  CATEGORY_META[category]?.label || category;
