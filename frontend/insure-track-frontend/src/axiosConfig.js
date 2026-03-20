import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8082/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If backend returns 401 (Unauthorized) or 403 (Forbidden), the token is likely expired
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.clear(); // Wipe the dead token
      window.location.href = "/login"; // Force them to login again
    }

    const msg = err.response?.data?.message || err.message || "Unexpected error";
    return Promise.reject(new Error(msg));
  }
);

export default api;
