import { Shield, Star, AlertCircle, TrendingUp, MessageCircle, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ORM = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center">
            <Shield className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Online Reputation Management</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Protect and enhance your brand's online reputation across review sites, social media, and search results. We monitor mentions, respond to reviews, and implement strategies to build trust and credibility.
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
              { icon: Eye, title: "24/7 Monitoring", desc: "Real-time alerts for brand mentions and reviews across the web" },
              { icon: MessageCircle, title: "Professional Response", desc: "Timely, professional responses to reviews and feedback" },
              { icon: AlertCircle, title: "Crisis Management", desc: "Quick response to negative situations before they escalate" },
              { icon: Star, title: "Review Generation", desc: "Strategies to encourage satisfied customers to leave positive reviews" },
              { icon: TrendingUp, title: "Brand Sentiment", desc: "Track and improve overall sentiment around your brand" },
              { icon: Shield, title: "Content Suppression", desc: "Push down negative content with positive SEO strategies" }
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
              { title: "Reputation Monitoring", desc: "Track mentions, reviews, and conversations about your brand" },
              { title: "Review Management", desc: "Monitor and respond to reviews on Google, Yelp, Facebook, and industry sites" },
              { title: "Crisis Response", desc: "Develop and execute crisis management plans for negative situations" },
              { title: "Positive Content Creation", desc: "Create and promote positive content to build brand authority" },
              { title: "Sentiment Analysis", desc: "Measure and track brand sentiment over time" },
              { title: "Competitor Monitoring", desc: "Track competitor reputation and identify opportunities" }
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
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Protect Your Brand?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's build and protect a stellar online reputation for your business.
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

export default ORM;
