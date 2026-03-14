import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/expenses");

export const getExpenses = async (params = {}) => {
  const hasPaging = Object.prototype.hasOwnProperty.call(params, "page") || Object.prototype.hasOwnProperty.call(params, "limit");

  if (hasPaging) {
    const res = await axios.get(API, {
      params,
      headers: getAuthHeaders()
    });

    return res.data?.data || [];
  }

  const pageSize = Number(params.limit) || 1000;
  let page = 1;
  let pages = 1;
  const items = [];

  do {
    const res = await axios.get(API, {
      params: {
        ...params,
        page,
        limit: pageSize
      },
      headers: getAuthHeaders()
    });

    items.push(...(res.data?.data || []));
    pages = Number(res.data?.pages) || 1;
    page += 1;
  } while (page <= pages);

  return items;
};

export const addExpense = async (data) => {

  const payload = {
    title: data.title || data.notes || "Expense",
    amount: Number(data.amount),
    category: data.category,
    notes: data.notes || ""
  };

  const res = await axios.post(API, payload, {
    headers: getAuthHeaders()
  });

  return res.data;

};

export const deleteExpense = async (id) => {

  const res = await axios.delete(`${API}/${id}`, {
    headers: getAuthHeaders()
  });

  return res.data;

};
