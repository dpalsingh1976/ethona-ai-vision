import { Smartphone, Star, Download, TrendingUp, Users, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AppMarketing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center">
            <Smartphone className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">App Marketing & ASO</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Launch and grow your mobile app with strategic app store optimization and user acquisition campaigns. We optimize listings, manage reviews, and run app install campaigns across iOS and Android platforms.
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
              { icon: Star, title: "ASO Expertise", desc: "Increase visibility and rankings in App Store and Google Play" },
              { icon: Download, title: "Install Campaigns", desc: "Cost-effective user acquisition through Apple Search Ads and Google UAC" },
              { icon: TrendingUp, title: "Conversion Rate Optimization", desc: "Optimize screenshots, videos, and descriptions for maximum installs" },
              { icon: Users, title: "User Retention", desc: "Strategies to reduce churn and increase lifetime value" },
              { icon: BarChart3, title: "Analytics & Attribution", desc: "Track installs, engagement, and revenue across all channels" },
              { icon: Star, title: "Review Management", desc: "Monitor and respond to reviews to maintain high ratings" }
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
              { title: "App Store Optimization", desc: "Title, subtitle, keywords, and visual asset optimization for iOS and Android" },
              { title: "User Acquisition Campaigns", desc: "Apple Search Ads, Google UAC, and social media app install campaigns" },
              { title: "Creative Testing", desc: "A/B test app icons, screenshots, and preview videos" },
              { title: "Localization", desc: "Optimize app listings for international markets" },
              { title: "Review & Rating Management", desc: "Encourage positive reviews and respond to user feedback" },
              { title: "Retention Analytics", desc: "Track user behavior, session length, and feature adoption" }
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
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Launch Your App?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's grow your mobile app with strategic ASO and user acquisition campaigns.
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

export default AppMarketing;
