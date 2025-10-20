import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Navbar = () => {
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
            <a href="#ai-automation" className="text-sm font-medium hover:opacity-80 transition-opacity">
              AI Automation
            </a>
            <a href="#services" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Services
            </a>
            <Link to="/about" className="text-sm font-medium hover:opacity-80 transition-opacity">
              About Us
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Contact Us
            </Link>
            <Link to="/contact">
              <Button className="bg-primary-foreground text-primary hover:opacity-90 rounded-full px-6 py-2 shadow-md">Get in Touch</Button>
            </Link>
          </div>

          {/* 📱 Mobile Menu Button (stays right) */}
          <button className="lg:hidden p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors ml-4" aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
