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
  Building,
  CreditCard,
  Calendar,
  Tag,
  Trash2,
  Save,
  Clock,
  PieChart,
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
} from "recharts";
import api, { 
  subscriptionAPI, 
  clientAPI, 
  workspaceAPI, 
  invoiceAPI, 
  alertAPI, 
  budgetAPI,
  userAPI 
} from "../utils/api";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({});
  const [workspaces, setWorkspaces] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form data
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: "",
    vendor: "",
    plan: "",
    amount: "",
    currency: "USD",
    period: "monthly",
    nextRenewalDate: "",
    category: "",
    notes: "",
    tags: "",
    workspaceId: ""
  });
  
  const [clientForm, setClientForm] = useState({
    name: "",
    contact: "",
    notes: "",
    workspaceId: ""
  });
  
  const [workspaceForm, setWorkspaceForm] = useState({
    name: ""
  });
  
  const [invoiceForm, setInvoiceForm] = useState({
    subscriptionId: "",
    fileUrl: "",
    amount: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    status: "pending",
    source: "upload"
  });

  const [alertForm, setAlertForm] = useState({
    subscriptionId: "",
    type: "renewal",
    dueDate: "",
    sentAt: ""
  });

  const [budgetForm, setBudgetForm] = useState({
    monthlyCap: "",
    alertThreshold: ""
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchUserData();
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceData();
    }
  }, [currentWorkspace]);

  const fetchUserData = async () => {
    try {
      const response = await userAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data);
      if (response.data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const fetchWorkspaceData = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    try {
      // Fetch subscriptions
      const subsResponse = await subscriptionAPI.getByWorkspace(currentWorkspace._id);
      setSubscriptions(subsResponse.data);
      
      // Fetch clients
      const clientsResponse = await clientAPI.getByWorkspace(currentWorkspace._id);
      setClients(clientsResponse.data);
      
      // Fetch budget
      try {
        const budgetResponse = await budgetAPI.getByWorkspace(currentWorkspace._id);
        setBudgets([budgetResponse.data]);
      } catch (error) {
        console.error("Error fetching budget:", error);
        setBudgets([]);
      }
      
      // Fetch invoices for all subscriptions
      const allInvoices = [];
      for (const sub of subsResponse.data) {
        try {
          const invoiceResponse = await invoiceAPI.getBySubscription(sub._id);
          allInvoices.push(...invoiceResponse.data);
        } catch (error) {
          console.error(`Error fetching invoices for subscription ${sub._id}:`, error);
        }
      }
      setInvoices(allInvoices);
      
      // Fetch alerts for all subscriptions
      const allAlerts = [];
      for (const sub of subsResponse.data) {
        try {
          const alertResponse = await alertAPI.getBySubscription(sub._id);
          allAlerts.push(...alertResponse.data);
        } catch (error) {
          console.error(`Error fetching alerts for subscription ${sub._id}:`, error);
        }
      }
      setAlerts(allAlerts);
      
    } catch (error) {
      console.error("Error fetching workspace data:", error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const createSubscription = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...subscriptionForm,
        workspaceId: currentWorkspace._id,
        amount: Number(subscriptionForm.amount),
        tags: subscriptionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        nextRenewalDate: new Date(subscriptionForm.nextRenewalDate).toISOString()
      };
      
      const response = await subscriptionAPI.create(formData);
      if (response.data.subscription) {
        setSubscriptions(prev => [...prev, response.data.subscription]);
        setShowSubscriptionForm(false);
        resetSubscriptionForm();
        fetchWorkspaceData(); // Refresh data
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Error creating subscription: " + (error.response?.data?.message || error.message));
    }
  };

  const updateSubscription = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...subscriptionForm,
        amount: Number(subscriptionForm.amount),
        tags: subscriptionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        nextRenewalDate: new Date(subscriptionForm.nextRenewalDate).toISOString()
      };
      
      const response = await subscriptionAPI.update(editingItem._id, formData);
      if (response.data.subscription) {
        setSubscriptions(prev => prev.map(sub => 
          sub._id === editingItem._id ? response.data.subscription : sub
        ));
        setShowSubscriptionForm(false);
        setEditingItem(null);
        resetSubscriptionForm();
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Error updating subscription: " + (error.response?.data?.message || error.message));
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    if (!window.confirm("Are you sure you want to delete this subscription?")) return;
    
    try {
      await subscriptionAPI.delete(subscriptionId);
      setSubscriptions(prev => prev.filter(sub => sub._id !== subscriptionId));
      // Also remove related invoices and alerts from state
      setInvoices(prev => prev.filter(inv => inv.subscriptionId !== subscriptionId));
      setAlerts(prev => prev.filter(alert => alert.subscriptionId !== subscriptionId));
    } catch (error) {
      console.error("Error deleting subscription:", error);
      alert("Error deleting subscription: " + (error.response?.data?.message || error.message));
    }
  };

  const createClient = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...clientForm,
        workspaceId: currentWorkspace._id
      };
      
      const response = await clientAPI.create(formData);
      if (response.data.client) {
        setClients(prev => [...prev, response.data.client]);
        setShowClientForm(false);
        resetClientForm();
      }
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Error creating client: " + (error.response?.data?.message || error.message));
    }
  };

  const updateClient = async (e) => {
    e.preventDefault();
    try {
      const response = await clientAPI.update(editingItem._id, clientForm);
      if (response.data.client) {
        setClients(prev => prev.map(client => 
          client._id === editingItem._id ? response.data.client : client
        ));
        setShowClientForm(false);
        setEditingItem(null);
        resetClientForm();
      }
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Error updating client: " + (error.response?.data?.message || error.message));
    }
  };

  const deleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    
    try {
      await clientAPI.delete(clientId);
      setClients(prev => prev.filter(client => client._id !== clientId));
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Error deleting client: " + (error.response?.data?.message || error.message));
    }
  };

  const createWorkspace = async (e) => {
    e.preventDefault();
    try {
      const response = await workspaceAPI.create(workspaceForm);
      if (response.data.workspace) {
        setWorkspaces(prev => [...prev, response.data.workspace]);
        setCurrentWorkspace(response.data.workspace);
        setShowWorkspaceForm(false);
        resetWorkspaceForm();
        fetchWorkspaceData();
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Error creating workspace: " + (error.response?.data?.message || error.message));
    }
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...invoiceForm,
        amount: Number(invoiceForm.amount),
        invoiceDate: new Date(invoiceForm.invoiceDate).toISOString()
      };
      
      const response = await invoiceAPI.create(formData);
      if (response.data.invoice) {
        setInvoices(prev => [...prev, response.data.invoice]);
        setShowInvoiceForm(false);
        resetInvoiceForm();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error creating invoice: " + (error.response?.data?.message || error.message));
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...alertForm,
        dueDate: new Date(alertForm.dueDate).toISOString(),
        sentAt: alertForm.sentAt ? new Date(alertForm.sentAt).toISOString() : null
      };
      
      const response = await alertAPI.create(formData);
      if (response.data.alert) {
        setAlerts(prev => [...prev, response.data.alert]);
        setShowAlertForm(false);
        resetAlertForm();
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Error creating alert: " + (error.response?.data?.message || error.message));
    }
  };

  const updateBudget = async (e) => {
    e.preventDefault();
    if (!budgets[0]) return;
    
    try {
      const formData = {
        monthlyCap: Number(budgetForm.monthlyCap),
        alertThreshold: Number(budgetForm.alertThreshold)
      };
      
      const response = await budgetAPI.update(budgets[0]._id, formData);
      if (response.data.budget) {
        setBudgets([response.data.budget]);
        setBudgetForm({
          monthlyCap: "",
          alertThreshold: ""
        });
        alert("Budget updated successfully!");
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      alert("Error updating budget: " + (error.response?.data?.message || error.message));
    }
  };

  // Form reset functions
  const resetSubscriptionForm = () => {
    setSubscriptionForm({
      name: "", vendor: "", plan: "", amount: "", currency: "USD",
      period: "monthly", nextRenewalDate: "", category: "", notes: "", tags: "", workspaceId: ""
    });
  };

  const resetClientForm = () => {
    setClientForm({ name: "", contact: "", notes: "", workspaceId: "" });
  };

  const resetWorkspaceForm = () => {
    setWorkspaceForm({ name: "" });
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      subscriptionId: "", fileUrl: "", amount: "", invoiceDate: new Date().toISOString().split('T')[0],
      status: "pending", source: "upload"
    });
  };

  const resetAlertForm = () => {
    setAlertForm({
      subscriptionId: "", type: "renewal", dueDate: "", sentAt: ""
    });
  };

  // Edit functions
  const editSubscription = (subscription) => {
    setEditingItem(subscription);
    setSubscriptionForm({
      name: subscription.name,
      vendor: subscription.vendor,
      plan: subscription.plan,
      amount: subscription.amount,
      currency: subscription.currency,
      period: subscription.period,
      nextRenewalDate: subscription.nextRenewalDate ? new Date(subscription.nextRenewalDate).toISOString().split('T')[0] : "",
      category: subscription.category,
      notes: subscription.notes,
      tags: subscription.tags?.join(', '),
      workspaceId: subscription.workspaceId
    });
    setShowSubscriptionForm(true);
  };

  const editClient = (client) => {
    setEditingItem(client);
    setClientForm({
      name: client.name,
      contact: client.contact,
      notes: client.notes,
      workspaceId: client.workspaceId
    });
    setShowClientForm(true);
  };

  const editBudget = () => {
    if (budgets[0]) {
      setBudgetForm({
        monthlyCap: budgets[0].monthlyCap,
        alertThreshold: budgets[0].alertThreshold
      });
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  // Calculate dashboard stats
  const totalMonthlySpend = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
  const activeSubscriptionsCount = subscriptions.length;
  const totalClientsCount = clients.length;
  const totalInvoicesCount = invoices.length;

  const upcomingRenewals = subscriptions.filter(sub => {
    if (!sub.nextRenewalDate) return false;
    const renewalDate = new Date(sub.nextRenewalDate);
    const daysUntilRenewal = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilRenewal <= 7 && daysUntilRenewal > 0;
  }).length;

  const urgentAlerts = alerts.filter(alert => {
    const dueDate = new Date(alert.dueDate);
    const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3;
  }).length;

  const currentBudget = budgets[0];
  const budgetUsage = currentBudget ? (totalMonthlySpend / currentBudget.monthlyCap) * 100 : 0;
  const budgetStatus = budgetUsage >= (currentBudget?.alertThreshold || 80) ? 'warning' : 'healthy';

  // Sample data for charts
  const spendingData = [
    { month: "Jan", amount: 1250 },
    { month: "Feb", amount: 1450 },
    { month: "Mar", amount: 1320 },
    { month: "Apr", amount: 1680 },
    { month: "May", amount: 1590 },
    { month: "Jun", amount: totalMonthlySpend || 1750 },
  ];

  const categoryData = subscriptions.reduce((acc, sub) => {
    const category = sub.category || "Uncategorized";
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += sub.amount;
    } else {
      acc.push({ 
        name: category, 
        value: sub.amount, 
        color: getRandomColor() 
      });
    }
    return acc;
  }, []);

  function getRandomColor() {
    const colors = ["#8b5cf6", "#a78bfa", "#60a5fa", "#db2777", "#4ade80", "#f59e0b", "#84cc16", "#06b6d4"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "urgent":
      case "overdue":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "warning":
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "active":
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRenewalStatus = (renewalDate) => {
    if (!renewalDate) return { status: "active", text: "Active", days: null };
    
    const date = new Date(renewalDate);
    const today = new Date();
    const daysUntil = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 0) return { status: "overdue", text: "Overdue", days: 0 };
    if (daysUntil <= 3) return { status: "urgent", text: `Due in ${daysUntil} days`, days: daysUntil };
    if (daysUntil <= 7) return { status: "warning", text: `Due in ${daysUntil} days`, days: daysUntil };
    return { status: "active", text: `Renews in ${daysUntil} days`, days: daysUntil };
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
    { id: "subscriptions", icon: CreditCard, label: "Subscriptions", badge: subscriptions.length },
    { id: "clients", icon: Users, label: "Clients", badge: clients.length },
    { id: "invoices", icon: FileText, label: "Invoices", badge: invoices.length },
    { id: "alerts", icon: Bell, label: "Alerts", badge: alerts.length },
    { id: "budgets", icon: Shield, label: "Budgets", badge: null },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black overflow-hidden pt-16">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-72" : "w-20"} fixed lg:sticky top-16 bottom-0 left-0 z-40 bg-gradient-to-b from-black to-purple-900/5 border-r border-white/10 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/50 hover:scale-105 transition-transform">
              {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
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
                  {sidebarOpen && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                </div>
                {item.badge !== null && sidebarOpen && (
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    activeTab === item.id ? "bg-white/20" : "bg-purple-600/30 text-purple-400"
                  }`}>
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
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer group">
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                <span className="font-medium text-sm text-red-400 group-hover:text-red-300">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-black/50 border-b border-white/10 sticky top-5 z-10 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === "dashboard" && "Dashboard Overview"}
                  {activeTab === "subscriptions" && "Subscriptions Management"}
                  {activeTab === "clients" && "Client Management"}
                  {activeTab === "invoices" && "Invoice Management"}
                  {activeTab === "alerts" && "Alert Center"}
                  {activeTab === "budgets" && "Budget Management"}
                </h2>
                <p className="text-xs text-gray-400">
                  {activeTab === "dashboard" && "Complete overview of your subscription ecosystem"}
                  {activeTab === "subscriptions" && "Manage all your subscription services"}
                  {activeTab === "clients" && "Handle client relationships and allocations"}
                  {activeTab === "invoices" && "Track and manage all invoices"}
                  {activeTab === "alerts" && "Monitor and manage subscription alerts"}
                  {activeTab === "budgets" && "Set and monitor spending limits"}
                </p>
              </div>
            </div>
            
            {/* Workspace Selector and Actions */}
            <div className="flex items-center space-x-4">
              {workspaces.length > 0 && (
                <select 
                  value={currentWorkspace?._id || ""} 
                  onChange={(e) => setCurrentWorkspace(workspaces.find(w => w._id === e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {workspaces.map(workspace => (
                    <option key={workspace._id} value={workspace._id}>{workspace.name}</option>
                  ))}
                </select>
              )}
              
              <button onClick={() => setShowWorkspaceForm(true)} className="p-2 hover:bg-white/5 rounded-xl transition-colors" title="Create Workspace">
                <Building className="w-5 h-5 text-gray-400" />
              </button>
              
              <button className="relative p-2 hover:bg-white/5 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                {urgentAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </button>
              
              {/* Action buttons based on active tab */}
              {activeTab === "subscriptions" && (
                <button onClick={() => { setEditingItem(null); setShowSubscriptionForm(true); }} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-purple-600/30">
                  <Plus className="w-4 h-4" />
                  <span>Add Subscription</span>
                </button>
              )}
              
              {activeTab === "clients" && (
                <button onClick={() => { setEditingItem(null); setShowClientForm(true); }} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-purple-600/30">
                  <Plus className="w-4 h-4" />
                  <span>Add Client</span>
                </button>
              )}
              
              {activeTab === "invoices" && (
                <button onClick={() => setShowInvoiceForm(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-purple-600/30">
                  <Plus className="w-4 h-4" />
                  <span>Add Invoice</span>
                </button>
              )}

              {activeTab === "alerts" && (
                <button onClick={() => setShowAlertForm(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-purple-600/30">
                  <Plus className="w-4 h-4" />
                  <span>Add Alert</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 rounded-2xl p-6 border border-purple-600/20 hover:border-purple-600/40 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className={`flex items-center text-sm font-semibold ${
                      budgetStatus === 'warning' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {budgetStatus === 'warning' ? <AlertCircle className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {Math.round(budgetUsage)}%
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">${totalMonthlySpend}</h3>
                  <p className="text-sm text-gray-400">Monthly Spend</p>
                  <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        budgetStatus === 'warning' 
                          ? 'bg-gradient-to-r from-red-600 to-pink-600' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600'
                      }`}
                      style={{ width: `${Math.min(100, budgetUsage)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/10 rounded-2xl p-6 border border-blue-600/20 hover:border-blue-600/40 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="flex items-center text-purple-400 text-sm font-semibold">
                      <AlertCircle className="w-4 h-4 mr-1" />{upcomingRenewals}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{activeSubscriptionsCount}</h3>
                  <p className="text-sm text-gray-400">Active Subscriptions</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">100%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/20 to-green-600/10 rounded-2xl p-6 border border-green-600/20 hover:border-green-600/40 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-400">Active</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{totalClientsCount}</h3>
                  <p className="text-sm text-gray-400">Total Clients</p>
                  <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-3/4"></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-900/20 to-orange-600/10 rounded-2xl p-6 border border-orange-600/20 hover:border-orange-600/40 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-orange-400" />
                    </div>
                    <span className="flex items-center text-green-400 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {invoices.filter(inv => inv.status === 'paid').length}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{totalInvoicesCount}</h3>
                  <p className="text-sm text-gray-400">Total Invoices</p>
                  <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Spending Trend</h3>
                      <p className="text-sm text-gray-400">Monthly expenditure analysis</p>
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
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
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
                          color: "#fff" 
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
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white">Category Split</h3>
                    <p className="text-sm text-gray-400">Spending by category</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
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
                          color: "#fff" 
                        }} 
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {categoryData.slice(0, 5).map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span className="text-sm text-gray-400 truncate flex-1">{cat.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">${cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Subscriptions */}
                <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Recent Subscriptions</h3>
                      <p className="text-sm text-gray-400">Your active subscriptions</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("subscriptions")} 
                      className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm font-semibold"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {subscriptions.slice(0, 5).map((sub) => {
                      const renewalStatus = getRenewalStatus(sub.nextRenewalDate);
                      return (
                        <div key={sub._id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/0 hover:border-purple-600/30">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-white text-sm truncate">{sub.name}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {sub.vendor} • {sub.plan}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {renewalStatus.text}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-white text-sm">${sub.amount}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(renewalStatus.status)}`}>
                              {renewalStatus.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {subscriptions.length === 0 && (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No subscriptions yet</p>
                        <button 
                          onClick={() => setShowSubscriptionForm(true)}
                          className="text-purple-400 hover:text-purple-300 text-sm mt-2"
                        >
                          Add your first subscription
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Recent Alerts</h3>
                      <p className="text-sm text-gray-400">Subscription notifications</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("alerts")} 
                      className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm font-semibold"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert) => {
                      const subscription = subscriptions.find(sub => sub._id === alert.subscriptionId);
                      const daysUntil = Math.ceil((new Date(alert.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysUntil <= 3;
                      
                      return (
                        <div key={alert._id} className={`p-4 rounded-xl border transition-all ${
                          isUrgent 
                            ? 'bg-red-500/10 border-red-500/30' 
                            : 'bg-white/5 border-white/10 hover:border-purple-600/30'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isUrgent ? 'bg-red-500/20' : 'bg-purple-600/20'
                              }`}>
                                <Bell className={`w-5 h-5 ${isUrgent ? 'text-red-400' : 'text-purple-400'}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-white text-sm">
                                  {subscription?.name || 'Unknown Subscription'}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">
                                  {alert.type} • Due {new Date(alert.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                              isUrgent 
                                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                : 'bg-purple-600/20 text-purple-400 border-purple-600/30'
                            }`}>
                              {isUrgent ? 'Urgent' : 'Info'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {alerts.length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No alerts yet</p>
                        <p className="text-gray-500 text-xs mt-1">Alerts will appear here for renewals and budgets</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Subscriptions Tab */}
          {activeTab === "subscriptions" && (
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Subscriptions</h3>
                  <p className="text-sm text-gray-400">Manage all your subscription services</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search subscriptions..."
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {subscriptions.map((sub) => {
                  const renewalStatus = getRenewalStatus(sub.nextRenewalDate);
                  return (
                    <div key={sub._id} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/0 hover:border-purple-600/30">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-bold text-white text-lg truncate">{sub.name}</p>
                            {sub.category && (
                              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium">
                                {sub.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-1">{sub.vendor} • {sub.plan}</p>
                          <p className="text-xs text-gray-500">
                            {renewalStatus.text} • 
                            {sub.tags && sub.tags.length > 0 && (
                              <span className="ml-2">
                                Tags: {sub.tags.join(', ')}
                              </span>
                            )}
                          </p>
                          {sub.notes && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-1">{sub.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="font-bold text-white text-xl">${sub.amount}</span>
                          <p className="text-sm text-gray-400">{sub.currency} • {sub.period}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(renewalStatus.status)}`}>
                          {renewalStatus.status}
                        </span>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => editSubscription(sub)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteSubscription(sub._id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {subscriptions.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No subscriptions yet</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first subscription</p>
                    <button 
                      onClick={() => { setEditingItem(null); setShowSubscriptionForm(true); }} 
                      className="btn-gradient"
                    >
                      Add Subscription
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Clients</h3>
                  <p className="text-sm text-gray-400">Manage your clients and cost allocations</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <div key={client._id} className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/0 hover:border-purple-600/30 transition-all group">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{client.name}</p>
                        <p className="text-sm text-gray-400">Client</p>
                      </div>
                    </div>
                    
                    {client.contact && (
                      <p className="text-sm text-gray-400 mb-2 truncate">{client.contact}</p>
                    )}
                    
                    {client.notes && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{client.notes}</p>
                    )}
                    
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => editClient(client)}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteClient(client._id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {clients.length === 0 && (
                  <div className="col-span-3 text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No clients yet</h3>
                    <p className="text-gray-500 mb-4">Add clients to allocate subscription costs</p>
                    <button 
                      onClick={() => { setEditingItem(null); setShowClientForm(true); }} 
                      className="btn-gradient"
                    >
                      Add Client
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Invoices</h3>
                  <p className="text-sm text-gray-400">Track and manage your subscription invoices</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Invoice ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Subscription</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Source</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => {
                      const subscription = subscriptions.find(sub => sub._id === invoice.subscriptionId);
                      return (
                        <tr key={invoice._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-sm font-mono text-purple-400">
                            INV-{invoice._id?.slice(-6) || 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-sm text-white font-semibold">
                            {subscription?.name || 'Unknown Subscription'}
                          </td>
                          <td className="py-4 px-4 text-sm text-white font-bold">${invoice.amount}</td>
                          <td className="py-4 px-4 text-sm text-gray-400">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-400 capitalize">{invoice.source}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {invoices.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No invoices yet</h3>
                    <p className="text-gray-500 mb-4">Invoices will appear here when you add them</p>
                    <button onClick={() => setShowInvoiceForm(true)} className="btn-gradient">
                      Add Invoice
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Alerts</h3>
                  <p className="text-sm text-gray-400">Subscription renewal and budget alerts</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const subscription = subscriptions.find(sub => sub._id === alert.subscriptionId);
                  const daysUntil = Math.ceil((new Date(alert.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntil <= 3;
                  const isOverdue = daysUntil < 0;
                  
                  return (
                    <div key={alert._id} className={`p-6 rounded-xl border transition-all ${
                      isOverdue
                        ? 'bg-red-500/20 border-red-500/50'
                        : isUrgent 
                          ? 'bg-orange-500/20 border-orange-500/50' 
                          : 'bg-white/5 border-white/10 hover:border-purple-600/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isOverdue
                              ? 'bg-red-500/20'
                              : isUrgent 
                                ? 'bg-orange-500/20' 
                                : 'bg-purple-600/20'
                          }`}>
                            <Bell className={`w-6 h-6 ${
                              isOverdue
                                ? 'text-red-400'
                                : isUrgent 
                                  ? 'text-orange-400' 
                                  : 'text-purple-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {subscription?.name || 'Unknown Subscription'}
                            </p>
                            <p className="text-sm text-gray-400 capitalize">
                              {alert.type} Alert
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(alert.dueDate).toLocaleDateString()} 
                              {isOverdue 
                                ? ' (Overdue)' 
                                : ` (in ${daysUntil} days)`
                              }
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                          isOverdue
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : isUrgent 
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                              : 'bg-purple-600/20 text-purple-400 border-purple-600/30'
                        }`}>
                          {isOverdue ? 'Overdue' : isUrgent ? 'Urgent' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {alerts.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No alerts yet</h3>
                    <p className="text-gray-500 mb-4">Alerts will appear here for upcoming renewals and budget thresholds</p>
                    <button onClick={() => setShowAlertForm(true)} className="btn-gradient">
                      Create Alert
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Budgets Tab */}
          {activeTab === "budgets" && (
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Budgets</h3>
                  <p className="text-sm text-gray-400">Set and monitor your spending limits</p>
                </div>
                {budgets[0] && (
                  <button 
                    onClick={editBudget}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-purple-500/50 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Budget</span>
                  </button>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {budgets.map((budget) => (
                  <div key={budget._id} className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/0 hover:border-purple-600/30 transition-all">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Monthly Budget</p>
                        <p className="text-sm text-gray-400">Workspace: {currentWorkspace?.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Monthly Cap</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-white">${budget.monthlyCap}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Alert Threshold</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-white">{budget.alertThreshold}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Alert when spending reaches ${Math.round(budget.monthlyCap * (budget.alertThreshold / 100))}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Current Spending</span>
                          <span>${totalMonthlySpend} / ${budget.monthlyCap}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              budgetUsage >= budget.alertThreshold 
                                ? 'bg-gradient-to-r from-red-600 to-pink-600' 
                                : 'bg-gradient-to-r from-green-600 to-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, budgetUsage)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{Math.round(budgetUsage)}% used</span>
                          <span className={totalMonthlySpend > budget.monthlyCap ? 'text-red-400' : ''}>
                            {totalMonthlySpend > budget.monthlyCap 
                              ? `Over budget by $${totalMonthlySpend - budget.monthlyCap}` 
                              : `$${budget.monthlyCap - totalMonthlySpend} remaining`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {budgets.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No budget set</h3>
                    <p className="text-gray-500 mb-4">Budgets are automatically created with workspaces</p>
                    <button onClick={() => setShowWorkspaceForm(true)} className="btn-gradient">
                      Create Workspace
                    </button>
                  </div>
                )}

                {/* Budget Update Form */}
                {budgetForm.monthlyCap && (
                  <div className="col-span-2 bg-white/5 rounded-xl p-6 border border-purple-600/30">
                    <h4 className="text-lg font-bold text-white mb-4">Update Budget</h4>
                    <form onSubmit={updateBudget} className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Monthly Cap ($)</label>
                        <input
                          type="number"
                          value={budgetForm.monthlyCap}
                          onChange={(e) => setBudgetForm({...budgetForm, monthlyCap: e.target.value})}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Alert Threshold (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={budgetForm.alertThreshold}
                          onChange={(e) => setBudgetForm({...budgetForm, alertThreshold: e.target.value})}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="flex-1 btn-gradient py-2">
                          <Save className="w-4 h-4 inline mr-2" />
                          Update Budget
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setBudgetForm({ monthlyCap: "", alertThreshold: "" })}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Forms */}
      {/* Subscription Form Modal */}
      {showSubscriptionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingItem ? 'Edit Subscription' : 'Add Subscription'}
            </h3>
            <form onSubmit={editingItem ? updateSubscription : createSubscription} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name *</label>
                  <input 
                    type="text" 
                    placeholder="Subscription Name" 
                    value={subscriptionForm.name} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, name: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Vendor *</label>
                  <input 
                    type="text" 
                    placeholder="Vendor" 
                    value={subscriptionForm.vendor} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, vendor: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Plan *</label>
                  <input 
                    type="text" 
                    placeholder="Plan" 
                    value={subscriptionForm.plan} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, plan: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Amount" 
                    value={subscriptionForm.amount} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, amount: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Currency</label>
                  <select 
                    value={subscriptionForm.currency} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, currency: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Period *</label>
                  <select 
                    value={subscriptionForm.period} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, period: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Next Renewal Date *</label>
                  <input 
                    type="date" 
                    placeholder="Next Renewal Date" 
                    value={subscriptionForm.nextRenewalDate} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, nextRenewalDate: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <input 
                    type="text" 
                    placeholder="Category" 
                    value={subscriptionForm.category} 
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, category: e.target.value})} 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="Tags (comma separated)" 
                  value={subscriptionForm.tags} 
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, tags: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                <textarea 
                  placeholder="Notes" 
                  value={subscriptionForm.notes} 
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, notes: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                  rows="3" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-gradient py-2">
                  {editingItem ? 'Update Subscription' : 'Create Subscription'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowSubscriptionForm(false);
                    setEditingItem(null);
                    resetSubscriptionForm();
                  }} 
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingItem ? 'Edit Client' : 'Add Client'}
            </h3>
            <form onSubmit={editingItem ? updateClient : createClient} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client Name *</label>
                <input 
                  type="text" 
                  placeholder="Client Name" 
                  value={clientForm.name} 
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Info</label>
                <input 
                  type="text" 
                  placeholder="Contact Info" 
                  value={clientForm.contact} 
                  onChange={(e) => setClientForm({...clientForm, contact: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                <textarea 
                  placeholder="Notes" 
                  value={clientForm.notes} 
                  onChange={(e) => setClientForm({...clientForm, notes: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                  rows="3" 
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-gradient py-2">
                  {editingItem ? 'Update Client' : 'Create Client'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowClientForm(false);
                    setEditingItem(null);
                    resetClientForm();
                  }} 
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Form Modal */}
      {showWorkspaceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Create Workspace</h3>
            <form onSubmit={createWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Workspace Name *</label>
                <input 
                  type="text" 
                  placeholder="Workspace Name" 
                  value={workspaceForm.name} 
                  onChange={(e) => setWorkspaceForm({...workspaceForm, name: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                  required 
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-gradient py-2">Create Workspace</button>
                <button 
                  type="button" 
                  onClick={() => setShowWorkspaceForm(false)} 
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Add Invoice</h3>
            <form onSubmit={createInvoice} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subscription *</label>
                <select 
                  value={invoiceForm.subscriptionId} 
                  onChange={(e) => setInvoiceForm({...invoiceForm, subscriptionId: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" 
                  required
                >
                  <option value="">Select Subscription</option>
                  {subscriptions.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">File URL</label>
                <input 
                  type="text" 
                  placeholder="File URL" 
                  value={invoiceForm.fileUrl} 
                  onChange={(e) => setInvoiceForm({...invoiceForm, fileUrl: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount ($) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Amount" 
                  value={invoiceForm.amount} 
                  onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Invoice Date *</label>
                <input 
                  type="date" 
                  placeholder="Invoice Date" 
                  value={invoiceForm.invoiceDate} 
                  onChange={(e) => setInvoiceForm({...invoiceForm, invoiceDate: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select 
                  value={invoiceForm.status} 
                  onChange={(e) => setInvoiceForm({...invoiceForm, status: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="void">Void</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Source</label>
                <select 
                  value={invoiceForm.source} 
                  onChange={(e) => setInvoiceForm({...invoiceForm, source: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="email">Email</option>
                  <option value="upload">Upload</option>
                  <option value="api">API</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-gradient py-2">Create Invoice</button>
                <button 
                  type="button" 
                  onClick={() => setShowInvoiceForm(false)} 
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Form Modal */}
      {showAlertForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Create Alert</h3>
            <form onSubmit={createAlert} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subscription *</label>
                <select 
                  value={alertForm.subscriptionId} 
                  onChange={(e) => setAlertForm({...alertForm, subscriptionId: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" 
                  required
                >
                  <option value="">Select Subscription</option>
                  {subscriptions.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Alert Type *</label>
                <select 
                  value={alertForm.type} 
                  onChange={(e) => setAlertForm({...alertForm, type: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" 
                  required
                >
                  <option value="renewal">Renewal</option>
                  <option value="budget">Budget</option>
                  <option value="invoice-missing">Invoice Missing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Due Date *</label>
                <input 
                  type="date" 
                  placeholder="Due Date" 
                  value={alertForm.dueDate} 
                  onChange={(e) => setAlertForm({...alertForm, dueDate: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sent At (Optional)</label>
                <input 
                  type="datetime-local" 
                  placeholder="Sent At" 
                  value={alertForm.sentAt} 
                  onChange={(e) => setAlertForm({...alertForm, sentAt: e.target.value})} 
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" 
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-gradient py-2">Create Alert</button>
                <button 
                  type="button" 
                  onClick={() => setShowAlertForm(false)} 
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;