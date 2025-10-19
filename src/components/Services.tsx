import { Search, Target, Share2, Mail, Smartphone, ShoppingCart, Users, TrendingUp, Shield } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

const services = [
  {
    icon: Search,
    title: "Search Engine Optimization",
    description: "Boost your organic visibility and drive quality traffic through data-driven SEO strategies. We optimize your website to rank higher on Google and convert visitors into customers.",
    link: "/services/seo",
    colorFrom: "from-cyan-100",
    colorTo: "to-blue-100",
    iconColor: "text-cyan-600",
  },
  {
    icon: Target,
    title: "Performance Marketing (PPC)",
    description: "Maximize ROI with precision-targeted paid advertising campaigns across Google Ads, Facebook, Instagram, and LinkedIn. We create and optimize campaigns that deliver measurable results.",
    link: "/services/ppc",
    colorFrom: "from-purple-100",
    colorTo: "to-pink-100",
    iconColor: "text-purple-600",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    description: "Build authentic connections and grow your brand presence across all major social platforms. From content creation to community management, we engage audiences and drive conversions.",
    link: "/services/smm",
    colorFrom: "from-pink-100",
    colorTo: "to-rose-100",
    iconColor: "text-pink-600",
  },
  {
    icon: Mail,
    title: "Email Marketing & Automation",
    description: "Nurture leads and retain customers with personalized email campaigns and intelligent automation workflows. We design campaigns that convert prospects into loyal customers.",
    link: "/services/email-marketing",
    colorFrom: "from-blue-100",
    colorTo: "to-indigo-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Smartphone,
    title: "App Marketing & ASO",
    description: "Launch and grow your mobile app with strategic app store optimization and user acquisition campaigns. We optimize listings and run install campaigns across iOS and Android.",
    link: "/services/app-marketing",
    colorFrom: "from-green-100",
    colorTo: "to-emerald-100",
    iconColor: "text-green-600",
  },
  {
    icon: ShoppingCart,
    title: "Marketplace Store Optimization",
    description: "Dominate Amazon, Etsy, eBay, and other marketplaces with optimized product listings and strategic advertising. We enhance visibility and increase sales.",
    link: "/services/marketplace-optimization",
    colorFrom: "from-orange-100",
    colorTo: "to-amber-100",
    iconColor: "text-orange-600",
  },
  {
    icon: Users,
    title: "Affiliate Marketing",
    description: "Build and scale revenue through performance-based affiliate partnerships. We recruit affiliates, manage programs, and optimize commissions for sustainable growth.",
    link: "/services/affiliate-marketing",
    colorFrom: "from-teal-100",
    colorTo: "to-cyan-100",
    iconColor: "text-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Conversion Rate Optimization",
    description: "Transform visitors into customers through scientific testing and UX optimization. We analyze behavior and refine your website to maximize conversions and revenue.",
    link: "/services/cro",
    colorFrom: "from-yellow-100",
    colorTo: "to-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: Shield,
    title: "Online Reputation Management",
    description: "Protect and enhance your brand's online reputation across review sites, social media, and search results. We monitor mentions and build trust and credibility.",
    link: "/services/orm",
    colorFrom: "from-red-100",
    colorTo: "to-pink-100",
    iconColor: "text-red-600",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">Our Services</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto text-lg">
          Comprehensive digital marketing solutions powered by data and AI automation
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
