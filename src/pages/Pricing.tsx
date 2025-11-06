import { Check, Rocket, Zap, Building2, Sparkles, Palette, Target, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="gradient-bg pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Digital Marketing Product Packages</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            We've streamlined digital marketing into flexible packages that make decisions easy and growth predictable.
          </p>
          <p className="text-lg text-muted-foreground font-medium">Roofing | Flooring | Furniture | Auto Dealerships</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* MarketMaster Plan Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
              {/* Icon Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">MarketMaster</h2>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">$1099</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <p className="text-sm font-semibold text-blue-600 mt-1 mb-2">SEO & Website Focus</p>
                <p className="text-muted-foreground">
                  Built for local SMBs ready to win on Google and convert more website visitors.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-foreground mb-4">Includes:</h3>
                {[
                  "Google Organic SEO",
                  "Google 3-Pack & Local Map presence",
                  "GMB Optimization & Automated Review Messaging",
                  "AI Visibility & Insights",
                  "Website Creation, Hosting & Support",
                  "Monthly Strategy Meeting",
                  "Dedicated Account Manager",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-2">Benefits:</h4>
                <div className="space-y-1 text-sm text-foreground">
                  <p>✅ Higher local visibility and qualified traffic</p>
                  <p>✅ More calls, directions, and form fills from nearby customers</p>
                  <p>✅ Foundation for all digital growth strategies</p>
                </div>
              </div>

              {/* CTA Button */}
              <Link to="/contact" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 rounded-full text-base font-semibold h-12">
                  Get Started Now
                </Button>
              </Link>
            </Card>

            {/* FutureForce Plan Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
              {/* Icon Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">FutureForce</h2>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">$1,099</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <p className="text-sm font-semibold text-orange-600 mt-1 mb-2">Complete Marketing Solution</p>
                <p className="text-muted-foreground">
                  The complete AI-powered growth engine for businesses ready to scale.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <h3 className="font-semibold text-foreground mb-4">Everything in MarketMaster, plus:</h3>
                {[
                  "Facebook & Instagram Ads",
                  "Google Ads Management (up to $2,500 ad spend)",
                  "Social Media Messaging & Organic Posts",
                  "CRM, Email Marketing & Automation",
                  "SMS Marketing",
                  "Call Tracking with dynamic number insertion",
                  "AI Chatbot & Virtual Agent (24/7)",
                  "Performance Analytics dashboards",
                  "Competitive Intelligence monitoring",
                  "Priority Technical Support",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-2">Benefits:</h4>
                <div className="space-y-1 text-sm text-foreground">
                  <p>✅ Complete toolkit for multi-channel marketing</p>
                  <p>✅ AI-powered systems for faster follow-up and higher close rates</p>
                  <p>✅ Comprehensive ROI tracking across all channels</p>
                </div>
              </div>

              {/* CTA Button */}
              <Link to="/contact" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 rounded-full text-base font-semibold h-12">
                  Get Started Now
                </Button>
              </Link>
            </Card>

            {/* Custom Plan Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-orange-300 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
              {/* Icon Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Custom Plan</h2>
              </div>

              {/* Subtitle & Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-3">Tailored to Your Needs</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Build your perfect marketing mix based on your business goals and budget.
                </p>
              </div>

              {/* Choose From List */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-4">Choose from:</h4>
                <div className="space-y-3">
                  {[
                    "Website Development & SEO",
                    "Google / Meta Ads Management",
                    "Social Media Management",
                    "Blog & Content Strategy",
                    "CRM Setup & Automation",
                    "Analytics Dashboard",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="text-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy Framework */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-4">Strategy Framework:</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Target className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">Dominate</p>
                      <p className="text-xs text-muted-foreground">Focus on Google SEO + Ads to build visibility</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">Retarget</p>
                      <p className="text-xs text-muted-foreground">Re-engage warm leads through targeted ads</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">Conquest</p>
                      <p className="text-xs text-muted-foreground">
                        Expand audience reach via influencer and cross-platform campaigns
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link to="/contact" className="block">
                <Button className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full text-base font-semibold h-12">
                  Book Free Strategy Call
                </Button>
              </Link>
            </Card>
          </div>

          {/* Add-Ons Section */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Optional Add-Ons</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enhance your package with additional services tailored to your specific needs.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Sparkles, title: "Custom Design Systems", desc: "Branded templates and design frameworks" },
                { icon: Building2, title: "Additional Social Platforms", desc: "TikTok, LinkedIn, Pinterest, YouTube" },
                { icon: Zap, title: "Advanced Automation", desc: "Custom workflows and integrations" },
                { icon: Rocket, title: "Landing Pages & Funnels", desc: "High-converting sales funnels" },
                { icon: Building2, title: "Additional Ad Budget", desc: "Scale your advertising spend" },
                { icon: Sparkles, title: "E-commerce Integrations", desc: "Connect your online store systems" },
              ].map((addon, index) => {
                const Icon = addon.icon;
                return (
                  <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{addon.title}</h3>
                    <p className="text-sm text-muted-foreground">{addon.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;
