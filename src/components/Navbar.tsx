import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ethonaLogo from "@/assets/ethona-logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center py-1">
            <img 
              src={ethonaLogo}
              alt="Ethona Digital Lab - Where Strategy Meets AI"
              className="h-12 md:h-14 w-auto object-contain"
              style={{
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1)) brightness(1.1)',
              }}
            />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <a href="/#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About Us</Link>
            <Link to="/contact">
              <Button className="bg-primary hover:bg-primary/90 rounded-full">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
