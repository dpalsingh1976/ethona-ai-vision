import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] rounded-lg" />
            <div>
              <div className="font-bold text-xl text-foreground">Ethona Digital Lab</div>
              <div className="text-xs text-muted-foreground">Where Strategy Meets AI</div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
            <a href="#cases" className="text-sm font-medium hover:text-primary transition-colors">Case Studies</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
            <Button className="bg-primary hover:bg-primary/90 rounded-full">Get in Touch</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
