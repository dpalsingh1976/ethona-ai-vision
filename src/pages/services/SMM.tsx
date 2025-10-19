import { Share2, Heart, MessageCircle, Users, Camera, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SMM = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center">
            <Share2 className="w-12 h-12 text-pink-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Social Media Marketing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Build authentic connections and grow your brand presence across all major social platforms. From content creation to community management, we craft strategies that engage audiences and drive conversions.
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
              { icon: Camera, title: "Creative Content", desc: "Stunning visuals, videos, and copy that stop the scroll and drive engagement" },
              { icon: Heart, title: "Community Building", desc: "Foster loyal communities through authentic engagement and timely responses" },
              { icon: TrendingUp, title: "Growth Strategies", desc: "Proven tactics to increase followers, reach, and brand awareness organically" },
              { icon: Users, title: "Influencer Partnerships", desc: "Strategic collaborations with influencers aligned with your brand values" },
              { icon: MessageCircle, title: "Social Listening", desc: "Monitor brand mentions and conversations to stay ahead of trends" },
              { icon: Share2, title: "Viral Campaigns", desc: "Create shareable content that amplifies your message across networks" }
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
              { title: "Content Strategy & Calendar", desc: "Comprehensive content planning across all platforms with optimal posting schedules" },
              { title: "Graphic Design & Video", desc: "Professional creatives designed for each platform's best practices" },
              { title: "Community Management", desc: "Daily monitoring, engagement, and timely responses to comments and messages" },
              { title: "Social Media Advertising", desc: "Targeted campaigns on Facebook, Instagram, LinkedIn, TikTok, and Twitter" },
              { title: "Analytics & Reporting", desc: "Track engagement, reach, growth, and conversion metrics" },
              { title: "Influencer Outreach", desc: "Identify and collaborate with relevant influencers for brand partnerships" }
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
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Go Viral?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's build a social media presence that engages, converts, and grows your brand.
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

export default SMM;
