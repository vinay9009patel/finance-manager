import axios from "axios";
import { getAuthHeaders, getMonthKey } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/budgets");
const OVERALL_CATEGORY = "overall";

const normalizeBudget = (item = {}) => {
  const budgetAmount = Number(item.budgetAmount ?? item.amount ?? 0);

  return {
    ...item,
    category: String(item.category || OVERALL_CATEGORY).toLowerCase(),
    budgetAmount,
    amount: budgetAmount,
    spent: Number(item.spent) || 0,
    remaining: Number(item.remaining ?? budgetAmount) || 0,
    percentUsed: Number(item.percentUsed) || 0,
    warning: Boolean(item.warning),
    exceeded: Boolean(item.exceeded)
  };
};

export const getBudgets = async (params = {}) => {
  const res = await axios.get(API, {
    params,
    headers: getAuthHeaders()
  });

  return (res.data || []).map(normalizeBudget);
};

export const createBudget = async ({
  category = OVERALL_CATEGORY,
  budgetAmount,
  month = getMonthKey()
}) => {
  const res = await axios.post(
    API,
    {
      category,
      budgetAmount: Number(budgetAmount) || 0,
      month
    },
    {
      headers: getAuthHeaders()
    }
  );

  return normalizeBudget(res.data?.budget || {});
};

export const updateBudget = async (id, {
  category = OVERALL_CATEGORY,
  budgetAmount,
  month = getMonthKey()
}) => {
  const res = await axios.put(
    `${API}/${id}`,
    {
      category,
      budgetAmount: Number(budgetAmount) || 0,
      month
    },
    {
      headers: getAuthHeaders()
    }
  );

  return normalizeBudget(res.data?.budget || {});
};

export const deleteBudget = async (id) => {
  const res = await axios.delete(`${API}/${id}`, {
    headers: getAuthHeaders()
  });

  return res.data;
};

export const getBudgetStatus = async (month = getMonthKey()) => {
  try {
    const res = await axios.get(`${API}/status`, {
      params: { month },
      headers: getAuthHeaders()
    });

    return {
      month,
      overallBudget: res.data?.overallBudget ? normalizeBudget(res.data.overallBudget) : null,
      categoryBudgets: (res.data?.categoryBudgets || []).map(normalizeBudget)
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return {
        month,
        overallBudget: null,
        categoryBudgets: []
      };
    }

    throw error;
  }
};

export const getBudgetWarnings = async (month = getMonthKey()) => {
  try {
    const res = await axios.get(`${API}/warning`, {
      params: { month },
      headers: getAuthHeaders()
    });

    return {
      ...res.data,
      warnings: (res.data?.warnings || []).map(normalizeBudget)
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return {
        month,
        warning: false,
        message: "Budget is under control",
        warnings: []
      };
    }

    throw error;
  }
};

export const getBudgetForMonth = async (month = getMonthKey()) => {
  const budgets = await getBudgets({
    month,
    category: OVERALL_CATEGORY
  });

  return budgets[0] || null;
};

export const getCategoryBudgetsForMonth = async (month = getMonthKey()) => {
  const status = await getBudgetStatus(month);
  return status.categoryBudgets;
};

export const saveBudget = async ({ amount, month = getMonthKey() }) =>
  createBudget({
    category: OVERALL_CATEGORY,
    budgetAmount: amount,
    month
  });
