import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Bell,
  Shield,
  FileText,
  Users,
  BarChart3,
  Lightbulb,
  FileSignature,
  Download,
  Settings,
  Menu,
  X,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  Eye,
  Edit,
  Upload,
  ChevronRight,
  Package,
  Zap,
  LogOut,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../utils/api";

const SubFlow = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({});

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const response = await api.get("/users/me");
      setUser(response.data);
    };
    fetchUserData();
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    // Notify other components in the same tab to update auth state
    try {
      window.dispatchEvent(new Event("authChanged"));
    } catch (e) {
      // ignore
    }
    navigate("/login");
  };

  // Sample data
  const spendingData = [
    { month: "Jan", amount: 1250, projected: 1300 },
    { month: "Feb", amount: 1450, projected: 1400 },
    { month: "Mar", amount: 1320, projected: 1450 },
    { month: "Apr", amount: 1680, projected: 1600 },
    { month: "May", amount: 1590, projected: 1650 },
    { month: "Jun", amount: 1750, projected: 1700 },
  ];

  const categoryData = [
    { name: "Design", value: 450, color: "#8b5cf6" },
    { name: "Dev Tools", value: 380, color: "#a78bfa" },
    { name: "Productivity", value: 290, color: "#60a5fa" },
    { name: "Marketing", value: 230, color: "#db2777" },
    { name: "Others", value: 150, color: "#4ade80" },
  ];

  const subscriptions = [
    {
      id: 1,
      name: "Figma Professional",
      category: "Design",
      amount: 45,
      nextRenewal: "2 days",
      status: "urgent",
      logo: "🎨",
    },
    {
      id: 2,
      name: "Notion Team Plan",
      category: "Productivity",
      amount: 96,
      nextRenewal: "5 days",
      status: "warning",
      logo: "📝",
    },
    {
      id: 3,
      name: "GitHub Pro",
      category: "Development",
      amount: 12,
      nextRenewal: "12 days",
      status: "active",
      logo: "💻",
    },
    {
      id: 4,
      name: "Canva Pro",
      category: "Design",
      amount: 13,
      nextRenewal: "18 days",
      status: "active",
      logo: "🎭",
    },
    {
      id: 5,
      name: "Grammarly Premium",
      category: "Productivity",
      amount: 29,
      nextRenewal: "3 days",
      status: "warning",
      logo: "✍️",
    },
    {
      id: 6,
      name: "Adobe Creative Cloud",
      category: "Design",
      amount: 55,
      nextRenewal: "25 days",
      status: "active",
      logo: "🎬",
    },
  ];

  const clientAllocation = [
    { client: "Tech Corp", amount: 650, percentage: 37 },
    { client: "Design Studio", amount: 480, percentage: 27 },
    { client: "Startup Inc", amount: 320, percentage: 18 },
    { client: "Agency XYZ", amount: 250, percentage: 18 },
  ];

  const recentInvoices = [
    {
      id: "INV-001",
      vendor: "Figma",
      amount: 45,
      date: "2024-10-28",
      status: "paid",
    },
    {
      id: "INV-002",
      vendor: "Notion",
      amount: 96,
      date: "2024-10-26",
      status: "paid",
    },
    {
      id: "INV-003",
      vendor: "GitHub",
      amount: 12,
      date: "2024-10-25",
      status: "pending",
    },
  ];

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
    { id: "inbox", icon: Inbox, label: "Subscription Inbox", badge: "12" },
    { id: "radar", icon: Bell, label: "Renewal Radar", badge: "4" },
    { id: "budget", icon: Shield, label: "Budget Guard", badge: null },
    { id: "invoices", icon: FileText, label: "Invoice Vault", badge: "3" },
    { id: "clients", icon: Users, label: "Client Allocation", badge: null },
    { id: "analytics", icon: BarChart3, label: "Usage Analytics", badge: null },
    { id: "optimization", icon: Lightbulb, label: "Optimization", badge: "2" },
    { id: "templates", icon: FileSignature, label: "Templates", badge: null },
    { id: "reports", icon: Download, label: "Reports", badge: null },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "urgent":
        return "bg-pink-600/20 text-pink-600 border-pink-600/30";
      case "warning":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "active":
        return "bg-green-400/20 text-green-400 border-green-400/30";
      case "paid":
        return "bg-green-400/20 text-green-400 border-green-400/30";
      case "pending":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-400/20 text-gray-400 border-gray-400/30";
    }
  };

  return (
    <div className="flex min-h-screen bg-black overflow-hidden pt-16">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } fixed lg:sticky top-16 bottom-0 left-0 z-40 bg-gradient-to-b from-black to-purple-900/5 border-r border-white/10 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Toggle Button */}
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

          {/* Navigation */}
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
                title={!sidebarOpen ? item.label : ""}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium text-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>
                {item.badge && sidebarOpen && (
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

          {/* User Profile */}
          {sidebarOpen && (
            <div className="p-4 border-t border-white/10 space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  AT
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
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

          {/* Logout button when sidebar is collapsed */}
          {!sidebarOpen && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 rounded-xl bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-black/50 border-b border-white/10 sticky top-5 z-10 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Dashboard Overview
                </h2>
                <p className="text-xs text-gray-400">
                  Track and manage all your subscriptions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  className="w-56 px-3 py-2 pl-9 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
              <button className="relative p-2 hover:bg-white/5 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-600 rounded-full animate-pulse"></span>
              </button>
              <button className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-purple-600/30">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 rounded-2xl p-6 border border-purple-600/20 hover:border-purple-600/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
                <span className="flex items-center text-green-400 text-sm font-semibold">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  12%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">$1,750</h3>
              <p className="text-sm text-gray-400">Monthly Spend</p>
              <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 w-3/4"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/10 rounded-2xl p-6 border border-blue-600/20 hover:border-blue-600/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <span className="flex items-center text-purple-400 text-sm font-semibold">
                  <AlertCircle className="w-4 h-4 mr-1" />4
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">12</h3>
              <p className="text-sm text-gray-400">Active Subscriptions</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-full"></div>
                </div>
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-900/20 to-pink-600/10 rounded-2xl p-6 border border-pink-600/20 hover:border-pink-600/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-pink-600" />
                </div>
                <span className="text-sm font-semibold text-gray-400">75%</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">$1,312</h3>
              <p className="text-sm text-gray-400">Budget Used</p>
              <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-600 to-pink-600 w-3/4"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-600/10 rounded-2xl p-6 border border-green-400/20 hover:border-green-400/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <span className="flex items-center text-green-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  8%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">$438</h3>
              <p className="text-sm text-gray-400">Potential Savings</p>
              <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-400 w-1/2"></div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending Trend */}
            <div className="lg:col-span-2 bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Spending Trend
                  </h3>
                  <p className="text-sm text-gray-400">
                    Monthly expenditure analysis
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-semibold border border-purple-600/30">
                    6M
                  </button>
                  <button className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-sm hover:bg-white/10">
                    1Y
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient
                      id="colorAmount"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #ffffff20",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Category Split</h3>
                <p className="text-sm text-gray-400">Spending by category</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #ffffff20",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></div>
                      <span className="text-sm text-gray-400">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      ${cat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions & Client Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Subscriptions */}
            <div className="lg:col-span-2 bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Active Subscriptions
                  </h3>
                  <p className="text-sm text-gray-400">
                    Manage your subscriptions
                  </p>
                </div>
                <button className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm font-semibold">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/0 hover:border-purple-600/30"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center text-2xl">
                        {sub.logo}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {sub.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sub.category} • Renews in {sub.nextRenewal}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-white">
                        ${sub.amount}/mo
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Cost Allocation */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">
                  Client Allocation
                </h3>
                <p className="text-sm text-gray-400">Cost distribution</p>
              </div>
              <div className="space-y-4">
                {clientAllocation.map((client, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {client.client}
                      </span>
                      <span className="text-sm font-bold text-white">
                        ${client.amount}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                          style={{ width: `${client.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">
                        {client.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Recent Invoices
                </h3>
                <p className="text-sm text-gray-400">Track your payments</p>
              </div>
              <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl font-semibold text-sm transition-all border border-purple-600/30 flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Invoice</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Invoice ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Vendor
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-mono text-purple-400">
                        {invoice.id}
                      </td>
                      <td className="py-4 px-4 text-sm text-white font-semibold">
                        {invoice.vendor}
                      </td>
                      <td className="py-4 px-4 text-sm text-white font-bold">
                        ${invoice.amount}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400">
                        {invoice.date}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubFlow;
