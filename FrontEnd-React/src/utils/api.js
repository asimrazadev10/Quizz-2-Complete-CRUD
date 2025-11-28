import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("authChanged"));
      // Don't redirect automatically, let components handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
};

// Subscription API
export const subscriptionAPI = {
  create: (data) => api.post("/subscriptions/", data),
  getByWorkspace: (workspaceId) => api.get(`/subscriptions/workspace/${workspaceId}`),
  get: (id) => api.get(`/subscriptions/${id}`),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

// Client API
export const clientAPI = {
  create: (data) => api.post("/clients/subscribe", data),
  getByWorkspace: (workspaceId) => api.get(`/clients/workspace/${workspaceId}`),
  get: (id) => api.get(`/clients/${id}`),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Workspace API
export const workspaceAPI = {
  create: (data) => api.post("/workspaces/", data),
  getAll: () => api.get("/workspaces"),
  get: (id) => api.get(`/workspaces/${id}`),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
};

// Invoice API
export const invoiceAPI = {
  create: (data) => api.post("/invoices/create-invoice", data),
  getBySubscription: (subscriptionId) => api.get(`/invoices/invoices/subscription/${subscriptionId}`),
  get: (id) => api.get(`/invoices/invoice/${id}`),
  update: (id, data) => api.put(`/invoices/invoice/${id}`, data),
  delete: (id) => api.delete(`/invoices/invoice/${id}`),
};

// Alert API
export const alertAPI = {
  create: (data) => api.post("/alerts/create-alert", data),
  getBySubscription: (subscriptionId) => api.get(`/alerts/alerts/subscription/${subscriptionId}`),
  get: (id) => api.get(`/alerts/alert/${id}`),
  update: (id, data) => api.put(`/alerts/alert/${id}`, data),
  delete: (id) => api.delete(`/alerts/alert/${id}`),
};

// Budget API
export const budgetAPI = {
  getByWorkspace: (workspaceId) => api.get(`/budgets/${workspaceId}`),
  update: (id, data) => api.put(`/budgets/${id}`, data),
};

// User API
export const userAPI = {
  getMe: () => api.get("/users/me"),
  update: (username, data) => api.put(`/users/${username}`, data),
  search: (query) => api.get(`/users/search?q=${query}`),
  getByUsername: (username) => api.get(`/users/${username}`),
};

export default api;