import logoIcon from "@/assets/ethona-logo-icon.png";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-primary text-primary-foreground">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logoIcon}
                alt="Ethona Digital Lab"
                className="h-12 w-16 object-contain"
                style={{
                  backgroundColor: "white",
                  padding: "0.25rem",
                  borderRadius: "0.375rem",
                }}
              />
              <div>
                <div className="font-bold text-lg">Ethona Digital Lab</div>
                <div className="text-xs opacity-80">Where Strategy Meets AI</div>
              </div>
            </div>
            <p className="text-sm opacity-80 max-w-md">
              Transforming businesses through innovative digital marketing strategies and cutting-edge AI automation solutions.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="/#services" className="hover:opacity-100 transition-opacity">Services</a></li>
              <li><a href="/about" className="hover:opacity-100 transition-opacity">About Us</a></li>
              <li><a href="/contact" className="hover:opacity-100 transition-opacity">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>info@ethonadigitallab.com</li>
              <li>+1 (646) 284-4268</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2025 Ethona Digital Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
