import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

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
          <Route path="/services/seo" element={<SEO />} />
          <Route path="/services/ppc" element={<PPC />} />
          <Route path="/services/smm" element={<SMM />} />
          <Route path="/services/email-marketing" element={<EmailMarketing />} />
          <Route path="/services/app-marketing" element={<AppMarketing />} />
          <Route path="/services/marketplace-optimization" element={<MarketplaceOptimization />} />
          <Route path="/services/affiliate-marketing" element={<AffiliateMarketing />} />
          <Route path="/services/cro" element={<CRO />} />
          <Route path="/services/orm" element={<ORM />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
