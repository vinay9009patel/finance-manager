import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/dashboard");

export const getDashboardData = async () => {
  try {

    const res = await axios.get(API, {
      headers: getAuthHeaders()
    });

    return res.data;

  } catch (error) {

    console.error("Dashboard API error:", error);

    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      streak: 0
    };

  }
};

export const getChildDashboardData = async (childId) => {
  const res = await axios.get(`${API}/children/${childId}`, {
    headers: getAuthHeaders()
  });

  return res.data;
};
