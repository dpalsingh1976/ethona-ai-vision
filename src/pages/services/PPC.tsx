import { Target, DollarSign, BarChart3, Users, Zap, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PPC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
            <Target className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Performance Marketing (PPC)</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Maximize ROI with precision-targeted paid advertising campaigns across Google Ads, Facebook, Instagram, and LinkedIn. We create, manage, and optimize campaigns that deliver measurable results and scale your business.
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
              { icon: DollarSign, title: "ROI Focused", desc: "Average 3-5X return on ad spend through continuous optimization and testing" },
              { icon: Target, title: "Precision Targeting", desc: "Laser-focused audience segmentation using demographics, interests, and behaviors" },
              { icon: Zap, title: "Rapid Scaling", desc: "Proven frameworks to scale winning campaigns from $1K to $100K+ monthly spend" },
              { icon: BarChart3, title: "Real-Time Analytics", desc: "Live dashboards tracking impressions, clicks, conversions, and cost per acquisition" },
              { icon: Users, title: "Multi-Platform Expertise", desc: "Master campaign management across Google, Facebook, Instagram, LinkedIn, and TikTok" },
              { icon: TrendingUp, title: "Conversion Optimization", desc: "Landing page optimization and A/B testing to maximize conversion rates" }
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
              { title: "Google Ads Management", desc: "Search, Display, Shopping, and YouTube ads optimized for maximum ROI" },
              { title: "Social Media Ads", desc: "Facebook, Instagram, LinkedIn, and TikTok campaigns with advanced targeting" },
              { title: "Remarketing Campaigns", desc: "Re-engage website visitors and convert them into customers" },
              { title: "Landing Page Design", desc: "High-converting landing pages built for mobile and desktop" },
              { title: "A/B Testing", desc: "Continuous testing of ad copy, creatives, and landing pages" },
              { title: "Campaign Reporting", desc: "Weekly and monthly reports with actionable insights and recommendations" }
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
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Scale Your Ads?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's create high-performing campaigns that drive qualified leads and revenue growth.
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

export default PPC;
