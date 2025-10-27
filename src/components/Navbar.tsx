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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground backdrop-blur-lg border-b border-primary-foreground/20 shadow-sm">
      {/* Full-width bar; adjust px to taste */}
      <div className="w-full px-4 md:px-6 py-3">
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
              className="text-sm font-medium hover:opacity-80 transition-opacity"
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
              className="text-sm font-medium hover:opacity-80 transition-opacity"
            >
              AI Automation
            </button>
            <button 
              onClick={() => handleScrollToSection('services')} 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Services
            </button>
            <Link to="/pricing" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium hover:opacity-80 transition-opacity">
              About Us
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Contact Us
            </Link>
          </div>

          {/* 📱 Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="lg:hidden p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors ml-4"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-primary text-primary-foreground">
              <SheetHeader>
                <SheetTitle className="text-primary-foreground">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  className="text-lg font-medium hover:opacity-80 transition-opacity py-2"
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
                  className="text-lg font-medium hover:opacity-80 transition-opacity py-2 text-left"
                >
                  AI Automation
                </button>
                <button
                  onClick={() => {
                    handleScrollToSection('services');
                    setMobileMenuOpen(false);
                  }}
                  className="text-lg font-medium hover:opacity-80 transition-opacity py-2 text-left"
                >
                  Services
                </button>
                <Link
                  to="/pricing"
                  className="text-lg font-medium hover:opacity-80 transition-opacity py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/about"
                  className="text-lg font-medium hover:opacity-80 transition-opacity py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="text-lg font-medium hover:opacity-80 transition-opacity py-2"
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
