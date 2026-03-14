import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/notifications");

export const fetchNotifications = async () => {
  const res = await axios.get(API, {
    headers: getAuthHeaders()
  });

  return res.data || [];
};

export const markNotificationsRead = async () => {
  await axios.patch(
    `${API}/read-all`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
};
