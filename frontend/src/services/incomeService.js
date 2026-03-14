import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/incomes");

export const getIncomes = async () => {
  const res = await axios.get(API, {
    headers: getAuthHeaders()
  });

  return res.data || [];
};

export const addIncome = async (payload) => {
  const res = await axios.post(API, payload, {
    headers: getAuthHeaders()
  });

  return res.data;
};
