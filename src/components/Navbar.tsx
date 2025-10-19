import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Search, Target, Share2, Mail, Smartphone, ShoppingCart, Users, TrendingUp, Shield } from "lucide-react";

const services = [
  { icon: Search, title: "SEO", link: "/services/seo" },
  { icon: Target, title: "Performance Marketing", link: "/services/ppc" },
  { icon: Share2, title: "Social Media Marketing", link: "/services/smm" },
  { icon: Mail, title: "Email Marketing", link: "/services/email-marketing" },
  { icon: Smartphone, title: "App Marketing & ASO", link: "/services/app-marketing" },
  { icon: ShoppingCart, title: "Marketplace Optimization", link: "/services/marketplace-optimization" },
  { icon: Users, title: "Affiliate Marketing", link: "/services/affiliate-marketing" },
  { icon: TrendingUp, title: "CRO", link: "/services/cro" },
  { icon: Shield, title: "ORM", link: "/services/orm" },
];

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] rounded-lg" />
            <div>
              <div className="font-bold text-xl text-foreground">Ethona Digital Lab</div>
              <div className="text-xs text-muted-foreground">Where Strategy Meets AI</div>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[600px] grid-cols-3 gap-3 p-6 bg-background">
                      {services.map((service) => (
                        <Link
                          key={service.link}
                          to={service.link}
                          className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent transition-colors group"
                        >
                          <service.icon className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">{service.title}</span>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
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
