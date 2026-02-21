import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Pricing from "./pages/Pricing";
import SEO from "./pages/services/SEO";
import PPC from "./pages/services/PPC";
import SMM from "./pages/services/SMM";
import EmailMarketing from "./pages/services/EmailMarketing";
import AppMarketing from "./pages/services/AppMarketing";
import MarketplaceOptimization from "./pages/services/MarketplaceOptimization";
import AffiliateMarketing from "./pages/services/AffiliateMarketing";
import CRO from "./pages/services/CRO";
import ORM from "./pages/services/ORM";
import Portfolio from "./pages/Portfolio";
import Demo from "./pages/Demo";
import RealEstateChatbot from "./pages/demos/RealEstateChatbot";
import GrowthAssessment from "./pages/GrowthAssessment";
import AiAgents from "./pages/AiAgents";
import NotFound from "./pages/NotFound";

// AI Agent Dashboard
import { AuthProvider } from "./hooks/useAuthContext";
import { AppLayout } from "./components/ai-agent/AppLayout";
import AiAgentAuth from "./pages/ai-agent/Auth";
import AiAgentDashboard from "./pages/ai-agent/Dashboard";
import AiAgentAgents from "./pages/ai-agent/Agents";
import AiAgentLeads from "./pages/ai-agent/Leads";
import AiAgentAppointments from "./pages/ai-agent/Appointments";
import AiAgentAnalytics from "./pages/ai-agent/Analytics";
import AiAgentPhoneNumbers from "./pages/ai-agent/PhoneNumbers";
import AiAgentSettings from "./pages/ai-agent/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/demo/real-estate-chatbot" element={<RealEstateChatbot />} />
          <Route path="/growth-assessment" element={<GrowthAssessment />} />
          <Route path="/ai-agents" element={<AiAgents />} />
          <Route path="/services/seo" element={<SEO />} />
          <Route path="/services/ppc" element={<PPC />} />
          <Route path="/services/smm" element={<SMM />} />
          <Route path="/services/email-marketing" element={<EmailMarketing />} />
          <Route path="/services/app-marketing" element={<AppMarketing />} />
          <Route path="/services/marketplace-optimization" element={<MarketplaceOptimization />} />
          <Route path="/services/affiliate-marketing" element={<AffiliateMarketing />} />
          <Route path="/services/cro" element={<CRO />} />
          <Route path="/services/orm" element={<ORM />} />

          {/* AI Agent Dashboard */}
          <Route path="/ai-agent" element={<AuthProvider><AppLayout /></AuthProvider>}>
            <Route index element={<Navigate to="/ai-agent/dashboard" replace />} />
            <Route path="dashboard" element={<AiAgentDashboard />} />
            <Route path="agents" element={<AiAgentAgents />} />
            <Route path="leads" element={<AiAgentLeads />} />
            <Route path="appointments" element={<AiAgentAppointments />} />
            <Route path="analytics" element={<AiAgentAnalytics />} />
            <Route path="phone-numbers" element={<AiAgentPhoneNumbers />} />
            <Route path="settings" element={<AiAgentSettings />} />
          </Route>
          <Route path="/ai-agent/auth" element={<AuthProvider><AiAgentAuth /></AuthProvider>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
