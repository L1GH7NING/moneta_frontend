// --- START OF FILE axios.js ---

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // This allows cookies to be sent and received
});

export default api;