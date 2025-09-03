import axios from "axios";

// Use Vite env variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to headers if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // get JWT from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: handle unauthorized globally
    if (error.response?.status === 401) {
      console.warn("Unauthorized, logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;