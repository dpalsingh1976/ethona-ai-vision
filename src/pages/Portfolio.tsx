import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Heart, 
  Sparkles, 
  Building2, 
  Hammer, 
  Smile, 
  Plane, 
  Users, 
  Scale, 
  Car, 
  ShoppingCart,
  ExternalLink
} from "lucide-react";

interface Client {
  name: string;
  url?: string;
}

interface Category {
  name: string;
  icon: React.ReactNode;
  clients: Client[];
}

const portfolioCategories: Category[] = [
  {
    name: "Healthcare & Medical",
    icon: <Heart className="w-6 h-6" />,
    clients: [
      { name: "Immediate Medical Care MD" },
      { name: "Skylake Medical Associates" },
      { name: "Dr Lucien Alexandre" },
      { name: "Center for Pain Treatment" },
      { name: "Mountain West Spine" },
      { name: "NeuLife Rehab" },
    ],
  },
  {
    name: "Med Spa & Aesthetics",
    icon: <Sparkles className="w-6 h-6" />,
    clients: [
      { name: "In.Shape Medical Spa" },
      { name: "ReSpa" },
      { name: "Daisy Merey MD" },
    ],
  },
  {
    name: "Real Estate",
    icon: <Building2 className="w-6 h-6" />,
    clients: [
      { name: "Golden Gate Team" },
      { name: "Sotheby's Realty Gold Coast" },
      { name: "FastExpert" },
      { name: "Prestige Real Estate Pro" },
    ],
  },
  {
    name: "Home Contractors",
    icon: <Hammer className="w-6 h-6" />,
    clients: [
      { name: "ARC Contracting" },
      { name: "800 Basements" },
      { name: "Gasper Roofing" },
      { name: "Champion Window" },
      { name: "CKC Custom Homes" },
    ],
  },
  {
    name: "Dental",
    icon: <Smile className="w-6 h-6" />,
    clients: [
      { name: "Florida Smile Design" },
    ],
  },
  {
    name: "Travel",
    icon: <Plane className="w-6 h-6" />,
    clients: [
      { name: "Discover Treasure Island FL" },
      { name: "Desert Safari Tours" },
    ],
  },
  {
    name: "Agency & Partners",
    icon: <Users className="w-6 h-6" />,
    clients: [
      { name: "Vertoz" },
      { name: "Webimax" },
    ],
  },
  {
    name: "Legal",
    icon: <Scale className="w-6 h-6" />,
    clients: [
      { name: "SOSRAFA" },
      { name: "The Medical Attorney" },
    ],
  },
  {
    name: "Automotive & Powersports",
    icon: <Car className="w-6 h-6" />,
    clients: [
      { name: "Brinson Athens" },
      { name: "Destination Cycle" },
      { name: "Link CDJR" },
    ],
  },
  {
    name: "Ecommerce",
    icon: <ShoppingCart className="w-6 h-6" />,
    clients: [
      { name: "Wheeler Advertising" },
      { name: "Magnets" },
      { name: "Customized Stickers" },
      { name: "Cutting Edge Stencils" },
    ],
  },
];

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,200,150,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,180,120,0.2),transparent_50%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Our Work
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Selected Client{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We've had the privilege of working with amazing businesses across diverse industries. 
            Here's a glimpse of the clients we've helped grow through digital marketing and AI solutions.
          </p>
        </div>
      </section>

      {/* Portfolio Categories */}
      <section className="py-16 bg-gradient-to-b from-[#FFF8EE] to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {portfolioCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {category.name}
                  </h2>
                </div>

                {/* Client Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.clients.map((client, clientIndex) => (
                    <div
                      key={clientIndex}
                      className="group bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/30 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {client.name}
                        </span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground text-sm italic">
              * Some engagements were delivered through agency partnerships
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-[#FDE9DD]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Join Our Success Stories?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Let's discuss how we can help grow your business with our proven digital marketing strategies and AI-powered solutions.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
          >
            Get in Touch
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
