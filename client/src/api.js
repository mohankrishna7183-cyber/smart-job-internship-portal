import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((request) => {
  const token = localStorage.getItem("orbit-token");
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("orbit-token");
      window.dispatchEvent(new Event("orbit:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.message || fallback;
}
