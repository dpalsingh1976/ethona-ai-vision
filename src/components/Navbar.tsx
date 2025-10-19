import { Button } from "@/components/ui/button";
import logo from "@/assets/ethona-logo.png"; // Ensure the logo is in src/assets

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Only (replacing text block) */}
          <div className="flex items-center gap-2">
            <a href="#home" className="flex items-center">
              <img
                src={logo}
                alt="Ethona Digital Lab"
                className="h-10 w-auto object-contain drop-shadow-sm hover:drop-shadow-md transition-all duration-300"
              />
            </a>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
              Home
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
            <Button className="bg-primary hover:bg-primary/90 rounded-full">Get in Touch</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
