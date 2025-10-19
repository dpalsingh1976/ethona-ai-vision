import { Button } from "@/components/ui/button";
import Logo from "./Logo";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Full Width */}
          <a href="#home" className="flex-1 hover:opacity-90 transition-opacity">
            <Logo />
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </a>
            <a href="#ai-automation" className="text-sm font-medium hover:text-primary transition-colors">
              AI Automation
            </a>
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </a>
            <a href="#cases" className="text-sm font-medium hover:text-primary transition-colors">
              Case Studies
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </a>
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-lg">
              Get in Touch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

