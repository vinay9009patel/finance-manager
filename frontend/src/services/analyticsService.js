import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/insights");
const SUMMARY_API = apiUrl("/api/insights/summary");
const LEGACY_API = apiUrl("/api/analytics");
const LEGACY_SUMMARY_API = apiUrl("/api/analytics/summary");

export const getAnalyticsSummary = async () => {
  try {
    const res = await axios.get(API, {
      headers: getAuthHeaders()
    });

    return res.data;
  } catch {
    try {
      const res = await axios.get(SUMMARY_API, {
        headers: getAuthHeaders()
      });

      return res.data;
    } catch {
      try {
        const res = await axios.get(LEGACY_API, {
          headers: getAuthHeaders()
        });

        return res.data;
      } catch {
        const res = await axios.get(LEGACY_SUMMARY_API, {
          headers: getAuthHeaders()
        });

        return res.data;
      }
    }
  }
};
