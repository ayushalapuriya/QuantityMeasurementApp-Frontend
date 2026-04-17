import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:8080"; // gateway

export const getUserHistory = async () => {
  const token = getToken();

  const response = await axios.get(`${BASE_URL}/history/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};