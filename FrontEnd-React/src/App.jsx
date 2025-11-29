import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navigation from "./components/navigation"
import Footer from "./components/footer"
import ScrollToTop from "./components/ScrollToTop"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminProtectedRoute from "./components/AdminProtectedRoute"
import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import DashboardPage from "./pages/DashboardPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import ServicesPage from "./pages/ServicesPage"
import ContactPage from "./pages/ContactPage"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import PricingPage from "./pages/PricingPage"
import CareersPage from "./pages/CareersPage"
import BlogPage from "./pages/BlogPage"
import HelpCenterPage from "./pages/HelpCenterPage"
import DocsPage from "./pages/DocsPage"
import PrivacyPage from "./pages/PrivacyPage"
import TermsPage from "./pages/TermsPage"
import CookiesPage from "./pages/CookiesPage"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <ScrollToTop />
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
