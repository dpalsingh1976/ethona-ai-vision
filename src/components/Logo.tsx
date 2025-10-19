import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/ethona-logo-icon.png"; // <-- the new icon you attached

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + wordmark (no background) */}
          <a href="#home" className="flex items-center gap-3" aria-label="Ethona Digital Lab">
            <img
              src={logoIcon}
              alt="Ethona Digital Lab logo"
              className="h-10 w-auto object-contain select-none"
              style={{ backgroundColor: "transparent" }}   // <-- make sure no box shows
              loading="eager"
              decoding="async"
            />
            <div className="leading-tight">
              <div className="font-semibold text-lg md:text-xl bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent tracking-tight">
                Ethona Digital Lab
              </div>
              <div className="text-[11px] md:text-xs text-muted-foreground">
                Where strategy meets AI
              </div>
            </div>
          </a>

          {/* Right-side nav unchanged */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About Us</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contact Us</a>
            <Button className="bg-primary hover:bg-primary/90 rounded-full">Get in Touch</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
