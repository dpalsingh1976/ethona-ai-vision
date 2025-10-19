import { Mail, Zap, Users, BarChart3, RefreshCw, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EmailMarketing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
            <Mail className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Email Marketing & Automation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Nurture leads and retain customers with personalized email campaigns and intelligent automation workflows. We design drip campaigns, newsletters, and triggered emails that convert prospects into loyal customers.
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
              { icon: Zap, title: "Advanced Automation", desc: "Intelligent workflows that nurture leads while you sleep" },
              { icon: Target, title: "Segmentation Mastery", desc: "Hyper-targeted messages based on behavior, demographics, and preferences" },
              { icon: BarChart3, title: "Data-Driven Results", desc: "Average open rates of 25%+ and click rates of 4%+ for clients" },
              { icon: RefreshCw, title: "Lifecycle Campaigns", desc: "Welcome series, abandoned cart recovery, and re-engagement sequences" },
              { icon: Users, title: "Personalization", desc: "Dynamic content that speaks directly to each subscriber" },
              { icon: Mail, title: "Deliverability Experts", desc: "Ensure your emails land in the inbox, not the spam folder" }
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
              { title: "Automation Workflows", desc: "Welcome series, drip campaigns, and behavioral triggers" },
              { title: "Email Design", desc: "Mobile-responsive templates that match your brand" },
              { title: "Copywriting", desc: "Compelling subject lines and body copy that drive clicks" },
              { title: "List Segmentation", desc: "Organize subscribers by interests, behavior, and engagement" },
              { title: "A/B Testing", desc: "Test subject lines, content, CTAs, and send times" },
              { title: "Analytics", desc: "Track opens, clicks, conversions, and revenue attribution" }
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
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Automate Your Growth?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's build email campaigns that nurture leads and drive revenue on autopilot.
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

export default EmailMarketing;
