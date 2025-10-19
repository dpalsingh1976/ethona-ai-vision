// src/components/Navbar.tsx
import { Button } from "@/components/ui/button";
import logo from "@/assets/ethona-logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo only */}
          <a href="#home" className="flex items-center">
            <img
              src={logo}
              alt="Ethona Digital Lab"
              className="h-9 w-auto object-contain select-none
                         mix-blend-screen          /* removes dark box on light bg */
                         drop-shadow-sm transition-all duration-300"
              loading="eager"
              decoding="async"
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium hover:text-primary">
              Home
            </a>
            <a href="#services" className="text-sm font-medium hover:text-primary">
              Services
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary">
              About Us
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary">
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
