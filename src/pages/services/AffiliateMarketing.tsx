import { Users, DollarSign, Link as LinkIcon, BarChart3, Shield, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AffiliateMarketing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl flex items-center justify-center">
            <Users className="w-12 h-12 text-teal-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Affiliate Marketing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Build and scale revenue through performance-based affiliate partnerships. We recruit affiliates, manage programs, track conversions, and optimize commissions to create a sustainable growth channel for your business.
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
              { icon: Users, title: "Partner Recruitment", desc: "Build a network of high-quality affiliates aligned with your brand" },
              { icon: DollarSign, title: "Revenue Growth", desc: "Performance-based model ensures you only pay for results" },
              { icon: LinkIcon, title: "Program Management", desc: "Handle all aspects of affiliate relationships and communications" },
              { icon: BarChart3, title: "Advanced Tracking", desc: "Real-time conversion tracking and accurate attribution" },
              { icon: Shield, title: "Fraud Prevention", desc: "Protect against fraudulent clicks and conversions" },
              { icon: TrendingUp, title: "Optimization", desc: "Continuously refine commission structures and promotional strategies" }
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
              { title: "Program Setup", desc: "Design commission structures, terms, and affiliate portal" },
              { title: "Affiliate Recruitment", desc: "Identify and onboard relevant affiliates, bloggers, and influencers" },
              { title: "Marketing Materials", desc: "Create banners, email templates, and promotional content" },
              { title: "Tracking & Attribution", desc: "Implement reliable tracking with cookie duration and multi-touch attribution" },
              { title: "Performance Monitoring", desc: "Track clicks, conversions, and commission payouts in real-time" },
              { title: "Compliance Management", desc: "Ensure affiliates follow FTC guidelines and brand standards" }
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
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Build Your Affiliate Network?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's create a performance-based growth channel that scales your revenue.
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

export default AffiliateMarketing;
