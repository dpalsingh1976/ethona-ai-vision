import { Search, TrendingUp, FileText, MapPin, Link as LinkIcon, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SEO = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center">
            <Search className="w-12 h-12 text-cyan-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Search Engine Optimization</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Boost your organic visibility and drive quality traffic through data-driven SEO strategies. We optimize your website structure, content, and backlinks to rank higher on Google and convert visitors into customers.
          </p>
          <Link to="/contact">
            <Button className="mt-8 rounded-full" size="lg">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#FFF8EE] to-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: "Proven Results", desc: "Track record of increasing organic traffic by 200%+ for clients across industries" },
              { icon: BarChart3, title: "Data-Driven Strategy", desc: "Every decision backed by analytics, keyword research, and competitor analysis" },
              { icon: Search, title: "Technical Excellence", desc: "Deep expertise in technical SEO, site speed optimization, and Core Web Vitals" },
              { icon: FileText, title: "Content Optimization", desc: "Strategic content creation that ranks and converts your target audience" },
              { icon: LinkIcon, title: "Quality Backlinks", desc: "White-hat link building strategies that build authority and trust" },
              { icon: MapPin, title: "Local SEO Mastery", desc: "Dominate local search results and Google My Business rankings" }
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

      {/* What We Offer */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">What We Offer</h2>
          <div className="space-y-6">
            {[
              { title: "Technical SEO Audit", desc: "Comprehensive site analysis identifying crawl errors, broken links, and technical issues" },
              { title: "On-Page Optimization", desc: "Title tags, meta descriptions, header structure, and internal linking optimization" },
              { title: "Content Strategy", desc: "Keyword research, content gap analysis, and editorial calendar planning" },
              { title: "Link Building", desc: "Authority backlink acquisition through outreach, guest posting, and PR" },
              { title: "Local SEO", desc: "Google Business Profile optimization, local citations, and review management" },
              { title: "Monthly Reporting", desc: "Transparent analytics dashboards tracking rankings, traffic, and conversions" }
            ].map((offer, index) => (
              <div key={index} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold mb-2 text-foreground">{offer.title}</h3>
                <p className="text-muted-foreground">{offer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-[#FDE9DD]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Rank Higher?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's build an SEO strategy that drives qualified traffic and measurable growth for your business.
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

export default SEO;
