import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/badges");

export const getBadges = async () => {
  const res = await axios.get(API, {
    headers: getAuthHeaders()
  });

  return res.data || [];
};
