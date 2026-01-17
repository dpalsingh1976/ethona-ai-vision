import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from "./Logo";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollToSection = (sectionId: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1b2028] backdrop-blur-lg border-b border-white/10 shadow-lg overflow-hidden">
      {/* Decorative SVG Curves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-20 -right-20 w-96 h-96 opacity-60" viewBox="0 0 400 400">
          <defs>
            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d="M400,0 Q300,100 200,80 T0,150 L0,0 Z" fill="url(#yellowGradient)" />
        </svg>
        
        <svg className="absolute top-0 right-0 w-80 h-80 opacity-50" viewBox="0 0 320 320">
          <defs>
            <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path d="M320,0 Q250,80 180,60 T50,120 L320,120 Z" fill="url(#tealGradient)" />
        </svg>
        
        <svg className="absolute top-10 -right-32 w-96 h-96 opacity-50" viewBox="0 0 400 400">
          <defs>
            <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d="M400,0 C350,100 300,150 250,180 Q200,210 150,200 T50,250 L400,250 Z" fill="url(#pinkGradient)" />
        </svg>
        
        <div className="absolute top-20 right-40 w-4 h-4 rounded-full bg-teal-400/40" />
        <div className="absolute top-32 right-64 w-3 h-3 rounded-full bg-yellow-400/40" />
        <div className="absolute top-14 right-52 w-2 h-2 rounded-full bg-pink-400/30" />
      </div>
      
      {/* Full-width bar; adjust px to taste */}
      <div className="w-full px-4 md:px-6 py-3 relative z-10">
        {/* Single flex row controlling layout */}
        <div className="flex items-center justify-between w-full">
          {/* ✅ Logo truly left (no extra wrappers, no extra px) */}
          <Link
            to="/"
            className="flex items-center hover:opacity-90 transition-opacity"
            aria-label="Ethona Digital Lab"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <Logo />
          </Link>

          {/* 🧭 Desktop Navigation on the right */}
          <div className="hidden lg:flex items-center gap-8 ml-auto">
            <Link 
              to="/" 
              className="text-sm font-medium text-white hover:text-white/80 transition-opacity"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              Home
            </Link>
            <button 
              onClick={() => handleScrollToSection('ai-automation')} 
              className="text-sm font-medium text-white hover:text-white/80 transition-opacity"
            >
              AI Automation
            </button>
            <button 
              onClick={() => handleScrollToSection('services')} 
              className="text-sm font-medium text-white hover:text-white/80 transition-opacity"
            >
              Services
            </button>
            <Link to="/pricing" className="text-sm font-medium text-white hover:text-white/80 transition-opacity">
              Pricing
            </Link>
            <Link to="/portfolio" className="text-sm font-medium text-white hover:text-white/80 transition-opacity">
              Portfolio
            </Link>
            <Link to="/about" className="text-sm font-medium text-white hover:text-white/80 transition-opacity">
              About Us
            </Link>
            <Link to="/contact" className="text-sm font-medium text-white hover:text-white/80 transition-opacity">
              Contact Us
            </Link>
          </div>

          {/* 📱 Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#1b2028] text-white border-l border-white/10">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  className="text-lg font-medium text-white hover:text-white/80 transition-opacity py-2"
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  Home
                </Link>
                <button
                  onClick={() => {
                    handleScrollToSection('ai-automation');
                    setMobileMenuOpen(false);
                  }}
                  className="text-lg font-medium text-white hover:text-white/80 transition-opacity py-2 text-left"
                >
                  AI Automation
                </button>
                <button
                  onClick={() => {
                    handleScrollToSection('services');
                    setMobileMenuOpen(false);
                  }}
                  className="text-lg font-medium text-white hover:text-white/80 transition-opacity py-2 text-left"
                >
                  Services
                </button>
                <Link
                  to="/pricing"
                  className="text-lg font-medium text-white hover:text-white/80 transition-opacity py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/portfolio"
                  className="text-lg font-medium text-white hover:text-white/80 transition-opacity py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Portfolio
                </Link>
                <Link
                  to="/about"
                  className="text-lg font-medium text-white hover:text-white/80 transition-opacity py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="text-lg font-medium text-white hover:text-white/80 transition-opacity py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
