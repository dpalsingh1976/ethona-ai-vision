import { ShoppingCart, Star, TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MarketplaceOptimization = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Marketplace Store Optimization</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Dominate Amazon, Etsy, eBay, and other marketplaces with optimized product listings and strategic advertising. We enhance visibility, manage reviews, and increase sales through marketplace-specific best practices.
          </p>
          <Link to="/contact">
            <Button className="mt-8 rounded-full" size="lg">Get Started</Button>
          </Link>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-[#FFF8EE] to-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: "Platform Expertise", desc: "Deep knowledge of Amazon, Etsy, eBay, Walmart, and niche marketplaces" },
              { icon: TrendingUp, title: "Increased Visibility", desc: "Optimize listings to rank higher in marketplace search results" },
              { icon: DollarSign, title: "Revenue Growth", desc: "Average 50%+ increase in sales through optimization and advertising" },
              { icon: Package, title: "Inventory Management", desc: "Strategic pricing and inventory planning to maximize profits" },
              { icon: Star, title: "Review Management", desc: "Proactive review monitoring and response strategies" },
              { icon: BarChart3, title: "Sponsored Campaigns", desc: "Manage sponsored product and brand campaigns for maximum ROI" }
            ].map((benefit, index) => (
              <div key={index} className="bg-card p-8 rounded-3xl shadow-card hover:shadow-hover transition-shadow">
                <benefit.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">What We Offer</h2>
          <div className="space-y-6">
            {[
              { title: "Product Listing Optimization", desc: "Title, bullet points, description, and image optimization for conversions" },
              { title: "Keyword Research", desc: "Identify high-volume, low-competition keywords for your products" },
              { title: "Sponsored Product Campaigns", desc: "Manage PPC campaigns on Amazon, Etsy, and eBay" },
              { title: "Review Strategy", desc: "Encourage positive reviews and manage negative feedback professionally" },
              { title: "Pricing Optimization", desc: "Competitive pricing analysis and dynamic pricing strategies" },
              { title: "Analytics & Reporting", desc: "Track sales, impressions, conversions, and advertising performance" }
            ].map((offer, index) => (
              <div key={index} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold mb-2 text-foreground">{offer.title}</h3>
                <p className="text-muted-foreground">{offer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-background to-[#FDE9DD]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Dominate Marketplaces?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's optimize your marketplace presence and drive sales across all platforms.
          </p>
          <Link to="/contact">
            <Button size="lg" className="rounded-full">Contact Our Team</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MarketplaceOptimization;
