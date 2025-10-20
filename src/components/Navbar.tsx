import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", isExternal: false },
    { to: "#ai-automation", label: "AI Automation", isExternal: true },
    { to: "#services", label: "Services", isExternal: true },
    { to: "/about", label: "About Us", isExternal: false },
    { to: "/contact", label: "Contact Us", isExternal: false },
  ];

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
                {navLinks.map((link) => (
                  link.isExternal ? (
                    <a
                      key={link.label}
                      href={link.to}
                      className="text-lg font-medium hover:opacity-80 transition-opacity py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-lg font-medium hover:opacity-80 transition-opacity py-2"
                      onClick={(e) => {
                        if (link.to === '/' && window.location.pathname === '/') {
                          e.preventDefault();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        setMobileMenuOpen(false);
                      }}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
