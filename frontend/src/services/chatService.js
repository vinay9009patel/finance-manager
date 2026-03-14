import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/chat");

export const sendMessage = async (message) => {
  const response = await axios.post(API, { message }, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const getChatHistory = async () => {
  const response = await axios.get(`${API}/history`, {
    headers: getAuthHeaders()
  });

  return response.data || [];
};
