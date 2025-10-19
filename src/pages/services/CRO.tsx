import { TrendingUp, MousePointer, BarChart3, Zap, Eye, TestTube } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CRO = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Conversion Rate Optimization</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform visitors into customers through scientific testing and UX optimization. We analyze user behavior, run A/B tests, and refine your website experience to maximize conversions and revenue per visitor.
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
              { icon: BarChart3, title: "Data-Driven Approach", desc: "Every recommendation backed by analytics and user research" },
              { icon: TestTube, title: "Rigorous Testing", desc: "A/B and multivariate testing to validate hypotheses" },
              { icon: Eye, title: "User Behavior Analysis", desc: "Heatmaps, session recordings, and funnel analysis" },
              { icon: Zap, title: "Quick Wins", desc: "Identify and implement high-impact changes first" },
              { icon: MousePointer, title: "UX Optimization", desc: "Improve navigation, CTAs, and overall user experience" },
              { icon: TrendingUp, title: "Revenue Increase", desc: "Average 30%+ lift in conversions for clients" }
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
              { title: "Conversion Audit", desc: "Comprehensive analysis of your funnel to identify friction points" },
              { title: "A/B Testing", desc: "Test headlines, CTAs, layouts, and copy to find winning variations" },
              { title: "Heatmap Analysis", desc: "Understand where users click, scroll, and drop off" },
              { title: "Landing Page Optimization", desc: "Design and test high-converting landing pages" },
              { title: "Checkout Flow Optimization", desc: "Reduce cart abandonment with streamlined checkout" },
              { title: "Mobile Optimization", desc: "Ensure seamless experience across all devices" }
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
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Boost Conversions?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's optimize your website to convert more visitors into paying customers.
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

export default CRO;
