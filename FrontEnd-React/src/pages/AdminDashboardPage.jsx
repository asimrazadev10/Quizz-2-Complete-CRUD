import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Search,
  LogOut,
  Shield,
  Mail,
  User as UserIcon,
  Building,
  DollarSign,
  Save,
  CheckCircle2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api, { userAPI, planAPI } from "../utils/api";
import { showToast } from "../utils/toast";
import ConfirmDialog from "../components/ConfirmDialog";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Users state
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user",
    companyName: "",
  });
  const [userSearch, setUserSearch] = useState("");

  // Plans state
  const [plans, setPlans] = useState([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    features: [], // Array of {key: "", value: ""}
  });
  const [planSearch, setPlanSearch] = useState("");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Delete",
    variant: "danger",
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchUserData();
      await fetchUsers();
      await fetchPlans();
      setInitialLoad(false);
    };
    loadData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await userAPI.getMe();
      setUser(response.data);
      // Check if user is admin
      if (response.data.role !== "admin") {
        showToast.error("Access Denied", "You must be an admin to access this page");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      console.log("Users response:", response);
      // Backend returns { data: users }
      const usersData = response.data?.data || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast.error("Error Fetching Users", error.response?.data?.message || error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planAPI.getAll();
      console.log("Plans response:", response);
      // Backend returns array directly
      const plansData = response.data || [];
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      showToast.error("Error Fetching Plans", error.response?.data?.message || error.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // User CRUD
  const createUser = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...userForm,
        password: userForm.password || undefined,
      };
      if (!formData.password) {
        delete formData.password;
      }
      const response = await userAPI.create(formData);
      // Backend returns { status: 201, message: "...", data: { user } }
      const newUser = response.data?.data?.user || response.data?.user;
      if (newUser) {
        setUsers((prev) => [newUser, ...prev]);
        showToast.success("User Created", `${newUser.name || newUser.username} has been created successfully!`);
        setShowUserForm(false);
        resetUserForm();
      } else {
        // If user data is not in expected format, refresh the list
        showToast.success("User Created", "User has been created successfully!");
        setShowUserForm(false);
        resetUserForm();
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showToast.error("Error Creating User", error.response?.data?.message || error.message);
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    if (!editingUser || !editingUser._id) {
      showToast.warning("No Selection", "No user selected for editing.");
      return;
    }
    try {
      const formData = { ...userForm };
      if (!formData.password || formData.password.trim() === "") {
        delete formData.password;
      }
      console.log("Updating user with data:", formData);
      const response = await userAPI.updateById(editingUser._id, formData);
      console.log("Update user response:", response);
      
      // Backend returns { status: 200, message: "...", data: { user: ... } }
      const updatedUser = response.data?.data?.user || response.data?.user;
      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u._id === editingUser._id ? updatedUser : u))
        );
        showToast.success("User Updated", `${updatedUser.name} has been updated successfully!`);
        setShowUserForm(false);
        setEditingUser(null);
        resetUserForm();
        fetchUsers(); // Refresh to ensure data is up to date
      } else {
        showToast.error("Update Failed", "User was not updated. Please check the response.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showToast.error("Error Updating User", error.response?.data?.message || error.message);
    }
  };

  const deleteUser = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete User",
      message: "Are you sure you want to delete this user? This action cannot be undone and will delete all associated data.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await userAPI.deleteById(userId);
          setUsers((prev) => prev.filter((u) => u._id !== userId));
          showToast.success("User Deleted", "User has been removed successfully!");
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          showToast.error("Error Deleting User", error.response?.data?.message || error.message);
        }
      },
    });
  };

  // Plan CRUD
  const createPlan = async (e) => {
    e.preventDefault();
    try {
      // Convert features array to JSON object
      const featuresJSON = {};
      planForm.features.forEach((feature) => {
        if (feature.key && feature.key.trim()) {
          featuresJSON[feature.key.trim()] = feature.value || "";
        }
      });

      const formData = {
        name: planForm.name,
        price: Number(planForm.price),
        featuresJSON: featuresJSON,
      };
      const response = await planAPI.create(formData);
      if (response.data?.plan) {
        setPlans((prev) => [response.data.plan, ...prev]);
        showToast.success("Plan Created", `${response.data.plan.name} has been created successfully!`);
        setShowPlanForm(false);
        resetPlanForm();
        fetchPlans();
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      showToast.error("Error Creating Plan", error.response?.data?.message || error.message);
    }
  };

  const updatePlan = async (e) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan._id) {
      showToast.warning("No Selection", "No plan selected for editing.");
      return;
    }
    try {
      // Convert features array to JSON object
      const featuresJSON = {};
      planForm.features.forEach((feature) => {
        if (feature.key && feature.key.trim()) {
          featuresJSON[feature.key.trim()] = feature.value || "";
        }
      });

      const formData = {
        name: planForm.name,
        price: Number(planForm.price),
        featuresJSON: featuresJSON,
      };
      console.log("Updating plan with data:", formData);
      const response = await planAPI.update(editingPlan._id, formData);
      console.log("Update plan response:", response);
      
      // Backend returns { status: 200, message: "...", plan: ... }
      const updatedPlan = response.data?.plan;
      if (updatedPlan) {
        setPlans((prev) =>
          prev.map((p) => (p._id === editingPlan._id ? updatedPlan : p))
        );
        showToast.success("Plan Updated", `${updatedPlan.name} has been updated successfully!`);
        setShowPlanForm(false);
        setEditingPlan(null);
        resetPlanForm();
        fetchPlans(); // Refresh to ensure data is up to date
      } else {
        showToast.error("Update Failed", "Plan was not updated. Please check the response.");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      showToast.error("Error Updating Plan", error.response?.data?.message || error.message);
    }
  };

  const deletePlan = async (planId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Plan",
      message: "Are you sure you want to delete this plan? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await planAPI.delete(planId);
          setPlans((prev) => prev.filter((p) => p._id !== planId));
          showToast.success("Plan Deleted", "Plan has been removed successfully!");
          fetchPlans();
        } catch (error) {
          console.error("Error deleting plan:", error);
          showToast.error("Error Deleting Plan", error.response?.data?.message || error.message);
        }
      },
    });
  };

  // Form handlers
  const editUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      companyName: user.companyName || "",
    });
    setShowUserForm(true);
  };

  const editPlan = (plan) => {
    setEditingPlan(plan);
    // Convert featuresJSON object to array format
    const features = plan.featuresJSON 
      ? Object.entries(plan.featuresJSON).map(([key, value]) => ({ key, value: String(value) }))
      : [];
    setPlanForm({
      name: plan.name || "",
      price: plan.price || "",
      features: features,
    });
    setShowPlanForm(true);
  };

  const resetUserForm = () => {
    setUserForm({
      username: "",
      name: "",
      email: "",
      password: "",
      role: "user",
      companyName: "",
    });
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: "",
      price: "",
      features: [],
    });
  };

  const addFeature = () => {
    setPlanForm({
      ...planForm,
      features: [...planForm.features, { key: "", value: "" }],
    });
  };

  const removeFeature = (index) => {
    setPlanForm({
      ...planForm,
      features: planForm.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index, field, value) => {
    const updatedFeatures = [...planForm.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setPlanForm({ ...planForm, features: updatedFeatures });
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    showToast.success("Logged Out", "You have been successfully logged out");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  // Filter users and plans
  const filteredUsers = users.filter((user) => {
    const searchLower = userSearch.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredPlans = plans.filter((plan) => {
    const searchLower = planSearch.toLowerCase();
    return plan.name?.toLowerCase().includes(searchLower);
  });

  // Stats
  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const regularUsers = users.filter((u) => u.role === "user").length;
  const totalPlans = plans.length;

  // Chart Data - User Growth Over Time
  const getUserGrowthData = () => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const usersInMonth = users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate >= monthStart && userDate <= monthEnd;
      }).length;
      
      last6Months.push({
        month: monthName,
        users: usersInMonth,
      });
    }
    return last6Months;
  };

  // Chart Data - User Role Distribution
  const getUserRoleData = () => {
    return [
      { name: "Admin", value: adminUsers, color: "#8b5cf6" },
      { name: "Regular Users", value: regularUsers, color: "#06b6d4" },
    ];
  };

  // Chart Data - Plan Pricing Distribution
  const getPlanPricingData = () => {
    return plans.map(plan => ({
      name: plan.name,
      price: plan.price,
      color: plan.price < 20 ? "#10b981" : plan.price < 50 ? "#f59e0b" : "#ef4444",
    }));
  };

  // Recent Users (last 7 days)
  const getRecentUsers = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return users
      .filter(u => new Date(u.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const userGrowthData = getUserGrowthData();
  const userRoleData = getUserRoleData();
  const planPricingData = getPlanPricingData();
  const recentUsers = getRecentUsers();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
    { id: "users", icon: Users, label: "Users", badge: totalUsers },
    { id: "plans", icon: Package, label: "Plans", badge: totalPlans },
  ];


  if (initialLoad && loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black overflow-hidden pt-16">
      <style>{`
        select option {
          background-color: #1a1a1a;
          color: white;
          padding: 8px;
        }
        select option:checked {
          background-color: #7c3aed;
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } fixed lg:sticky top-16 bottom-0 left-0 z-40 bg-gradient-to-b from-black to-purple-900/5 border-r border-white/10 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/50 hover:scale-105 transition-transform"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium text-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>
                {item.badge !== null && sidebarOpen && (
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${
                      activeTab === item.id
                        ? "bg-white/20"
                        : "bg-purple-600/30 text-purple-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="p-4 border-t border-white/10 space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || user?.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer group"
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                <span className="font-medium text-sm text-red-400 group-hover:text-red-300">
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
        <header className="bg-black/50 border-b border-white/10 sticky top-5 z-10 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === "dashboard" && "Admin Dashboard Overview"}
                  {activeTab === "users" && "User Management"}
                  {activeTab === "plans" && "Plan Management"}
                </h2>
                <p className="text-sm text-gray-400">
                  {activeTab === "dashboard" && "Manage users and plans"}
                  {activeTab === "users" && "Create, update, and delete users"}
                  {activeTab === "plans" && "Create, update, and delete plans"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-600/30 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{totalUsers}</h3>
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{adminUsers}</h3>
                  <p className="text-sm text-gray-400">Admin Users</p>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600/30 rounded-xl flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{regularUsers}</h3>
                  <p className="text-sm text-gray-400">Regular Users</p>
                </div>

                <div className="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 rounded-2xl p-6 border border-orange-500/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-600/30 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{totalPlans}</h3>
                  <p className="text-sm text-gray-400">Total Plans</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setActiveTab("users");
                      setShowUserForm(true);
                      resetUserForm();
                      setEditingUser(null);
                    }}
                    className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                  >
                    <Plus className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Create New User</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("plans");
                      setShowPlanForm(true);
                      resetPlanForm();
                      setEditingPlan(null);
                    }}
                    className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                  >
                    <Plus className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Create New Plan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUserForm(true);
                    resetUserForm();
                    setEditingUser(null);
                  }}
                  className="btn-gradient px-4 py-2 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="bg-black/40 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {u.name?.charAt(0) || u.username?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{u.name || u.username}</p>
                                <p className="text-xs text-gray-400">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-300">{u.email}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              u.role === "admin" 
                                ? "bg-purple-600/30 text-purple-400" 
                                : "bg-blue-600/30 text-blue-400"
                            }`}>
                              {u.role || "user"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-300">{u.companyName || "-"}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => editUser(u)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteUser(u._id)}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No users found</h3>
                    <p className="text-gray-500 mb-4">
                      {userSearch ? "Try adjusting your search" : "Get started by creating a new user"}
                    </p>
                    {!userSearch && (
                      <button onClick={() => { setShowUserForm(true); resetUserForm(); setEditingUser(null); }} className="btn-gradient">
                        Add User
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === "plans" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search plans..."
                      value={planSearch}
                      onChange={(e) => setPlanSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPlanForm(true);
                    resetPlanForm();
                    setEditingPlan(null);
                  }}
                  className="btn-gradient px-4 py-2 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Plan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlans.map((plan) => (
                  <div key={plan._id} className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                        <p className="text-2xl font-bold text-purple-400">
                          ${plan.price}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editPlan(plan)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit Plan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePlan(plan._id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {plan.featuresJSON && Object.keys(plan.featuresJSON).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">Features:</p>
                        <div className="space-y-1">
                          {Object.entries(plan.featuresJSON).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2 text-sm text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              <span>{key}: {String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredPlans.length === 0 && (
                <div className="text-center py-12 bg-black/40 rounded-2xl border border-white/10">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No plans found</h3>
                  <p className="text-gray-500 mb-4">
                    {planSearch ? "Try adjusting your search" : "Get started by creating a new plan"}
                  </p>
                  {!planSearch && (
                    <button onClick={() => { setShowPlanForm(true); resetPlanForm(); setEditingPlan(null); }} className="btn-gradient">
                      Add Plan
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="p-6 pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? "Edit User" : "Create New User"}
              </h3>
            </div>
            <form onSubmit={editingUser ? updateUser : createUser} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username *</label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Password {editingUser ? "(leave blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    style={{ colorScheme: 'dark' }}
                    required
                  >
                    <option value="user" className="bg-gray-900 text-white">User</option>
                    <option value="admin" className="bg-gray-900 text-white">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                  <input
                    type="text"
                    placeholder="Company Name (optional)"
                    value={userForm.companyName}
                    onChange={(e) => setUserForm({ ...userForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="p-6 pt-4 border-t border-white/10">
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 btn-gradient py-2">
                    {editingUser ? "Update User" : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      resetUserForm();
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      

      {/* Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="p-6 pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {editingPlan ? "Edit Plan" : "Create New Plan"}
              </h3>
            </div>
            <form onSubmit={editingPlan ? updatePlan : createPlan} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Plan Name *</label>
                  <input
                    type="text"
                    placeholder="Plan Name"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-400">Features</label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-semibold border border-purple-600/30 transition-all flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {planForm.features.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No features added. Click "Add Feature" to add one.</p>
                    ) : (
                      planForm.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
                          <input
                            type="text"
                            placeholder="Feature name"
                            value={feature.key}
                            onChange={(e) => updateFeature(index, "key", e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Feature value"
                            value={feature.value}
                            onChange={(e) => updateFeature(index, "value", e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            title="Remove Feature"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 pt-4 border-t border-white/10">
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 btn-gradient py-2">
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlanForm(false);
                      setEditingPlan(null);
                      resetPlanForm();
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
      
    </div>
  );
};

export default AdminDashboardPage;
        