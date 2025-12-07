import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // Vite proxy handles the actual port
  headers: {
    "Content-Type": "application/json",
  },
});
