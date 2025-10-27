import { Check, Rocket, Palette, Target, Users, TrendingUp } from "lucide-react";
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Digital Marketing Plans
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            At Ethona Digital Lab, we believe in simplicity and results. Instead of confusing multi-tiered packages, 
            we offer two straightforward plans that include everything your business needs to grow — from SEO to ads, 
            AI optimization, CRM, and reporting.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Premium Plan Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
              {/* Icon Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Premium Plan</h2>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">$1,600</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  A fully inclusive digital marketing plan designed to enhance your brand presence and drive measurable growth.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-foreground mb-4">Includes:</h3>
                {[
                  "Custom WordPress Website (SEO-friendly & mobile optimized)",
                  "Website Maintenance & Security",
                  "SEO (On-page, Off-page, Local, Technical)",
                  "AI Optimization (Content, Targeting, Analytics)",
                  "Paid Media Management (Google Ads + Meta Ads up to $2,500 spend)",
                  "Facebook & Instagram Management",
                  "2 Blog Articles per Month",
                  "CRM & Call Tracking Integration",
                  "Monthly Reports & Analytics"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Why it Works */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-2">Why it works:</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This plan combines advanced tools and expert strategy — everything your business needs in one place.
                </p>
                <div className="space-y-1 text-sm text-foreground">
                  <p>✅ No hidden fees.</p>
                  <p>✅ No confusing add-ons.</p>
                  <p>✅ Just transparent, effective results.</p>
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
            <Card className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
              {/* Icon Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Custom Plan</h2>
              </div>

              {/* Subtitle */}
              <div className="mb-6">
                <p className="text-xl font-semibold text-foreground mb-2">Tailored to Your Needs</p>
                <p className="text-muted-foreground">
                  Build your perfect marketing mix based on your business goals and budget.
                </p>
              </div>

              {/* Services Selection */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-4">Choose from:</h3>
                <div className="space-y-3">
                  {[
                    "Website Development & SEO",
                    "Google / Meta Ads Management",
                    "Social Media Management",
                    "Blog & Content Strategy",
                    "CRM Setup & Automation",
                    "Analytics Dashboard"
                  ].map((service, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-foreground text-sm leading-relaxed">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy Framework */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-4">Strategy Framework:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Dominate</p>
                      <p className="text-xs text-muted-foreground">Focus on Google SEO + Ads to build visibility</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Retarget</p>
                      <p className="text-xs text-muted-foreground">Re-engage warm leads through targeted ads</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Conquest</p>
                      <p className="text-xs text-muted-foreground">Expand audience reach via influencer and cross-platform campaigns</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link to="/contact" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 rounded-full text-base font-semibold h-12">
                  Book Free Strategy Call
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;
