import axios from "axios";
import { getAuthHeaders } from "../utils/helper";
import { apiUrl } from "./apiConfig";

const API = apiUrl("/api/auth");

export const login = async (credentials) => {
  const res = await axios.post(`${API}/login`, credentials);
  return res.data;
};

export const register = async (payload) => {
  const res = await axios.post(`${API}/register`, payload);
  return res.data;
};

export const linkParent = async (parentCode) => {
  const res = await axios.post(
    `${API}/link-parent`,
    { parentCode },
    {
      headers: getAuthHeaders()
    }
  );

  return res.data;
};

export const linkStudent = async ({ childEmail, childId, childCode }) => {
  const res = await axios.post(
    `${API}/link-student`,
    { childEmail, childId, childCode },
    {
      headers: getAuthHeaders()
    }
  );

  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await axios.put(`${API}/profile`, payload, {
    headers: getAuthHeaders()
  });

  return res.data;
};
