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

// Client API - FIX: Change /subscribe to /
export const clientAPI = {
  create: (data) => api.post("/clients/", data),
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

// Invoice API - FIX: Remove redundant path segments
export const invoiceAPI = {
  create: (data) => api.post("/invoices/", data),
  getBySubscription: (subscriptionId) => api.get(`/invoices/subscription/${subscriptionId}`),
  get: (id) => api.get(`/invoices/${id}`),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
};

// Alert API - FIX: Remove redundant path segments
export const alertAPI = {
  create: (data) => api.post("/alerts/", data),
  getBySubscription: (subscriptionId) => api.get(`/alerts/subscription/${subscriptionId}`),
  getByWorkspace: (workspaceId) => api.get(`/alerts/workspace/${workspaceId}`),
  get: (id) => api.get(`/alerts/${id}`),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`),
  triggerChecks: () => api.post("/alerts/trigger-checks"),
};

// Budget API
// Budget API
export const budgetAPI = {
  getByWorkspace: (workspaceId) => api.get(`/budgets/${workspaceId}`),
  update: (id, data) => api.put(`/budgets/${id}`, data),  // This is correct now
};


// Subscription Client API
export const subscriptionClientAPI = {
  linkClient: (data) => api.post("/subscriptionClients/link-client", data),
  unlinkClient: (data) => api.post("/subscriptionClients/unlink-client", data),
  getClientsForSubscription: (subscriptionId) => api.get(`/subscriptionClients/clients/${subscriptionId}`),
  getSubscriptionsForClient: (clientId) => api.get(`/subscriptionClients/subscriptions/${clientId}`),
};

// User API
export const userAPI = {
  getMe: () => api.get("/users/me"),
  update: (username, data) => api.put(`/users/${username}`, data),
  search: (query) => api.get(`/users/search?q=${query}`),
  getByUsername: (username) => api.get(`/users/${username}`),
  // Admin endpoints
  getAll: () => api.get("/users/admin/all"),
  create: (data) => api.post("/users/admin/create", data),
  updateById: (id, data) => api.put(`/users/admin/${id}`, data),
  deleteById: (id) => api.delete(`/users/admin/${id}`),
};

// Plan API
export const planAPI = {
  getAll: () => api.get("/plans/getPlans"),
  get: (id) => api.get(`/plans/getPlan/${id}`),
  create: (data) => api.post("/plans/createPlan", data),
  update: (id, data) => api.put(`/plans/updatePlan/${id}`, data),
  delete: (id) => api.delete(`/plans/deletePlan/${id}`),
};

export default api;
