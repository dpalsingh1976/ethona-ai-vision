import { Button } from "@/components/ui/button";
import Logo from "./Logo";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border shadow-sm">
      {/* Full-width bar; adjust px to taste */}
      <div className="w-full px-4 md:px-6 py-3">
        {/* Single flex row controlling layout */}
        <div className="flex items-center justify-between w-full">
          {/* ✅ Logo truly left (no extra wrappers, no extra px) */}
          <a
            href="#home"
            className="flex items-center hover:opacity-90 transition-opacity"
            aria-label="Ethona Digital Lab"
          >
            <Logo />
          </a>

          {/* 🧭 Desktop Navigation on the right */}
          <div className="hidden lg:flex items-center gap-8 ml-auto">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </a>
            <a href="#ai-automation" className="text-sm font-medium hover:text-primary transition-colors">
              AI Automation
            </a>
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About Us
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact Us
            </a>
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 py-2 shadow-md">Get in Touch</Button>
          </div>

          {/* 📱 Mobile Menu Button (stays right) */}
          <button className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors ml-4" aria-label="Open menu">
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
