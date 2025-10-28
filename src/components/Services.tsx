import { Search, Target, Share2, Mail, Smartphone, ShoppingCart, Users, TrendingUp, Shield } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

const services = [
  {
    icon: Search,
    title: "Search Engine Optimization",
    description:
      "Boost your organic visibility and drive quality traffic through data-driven SEO strategies. We optimize your website to rank higher on Google and convert visitors into customers.",

    bgColor: "bg-[#FFF5E6]",

    link: "/services/seo",
  },
  {
    icon: Target,
    title: "Performance Marketing (PPC)",
    description:
      "Maximize ROI with precision-targeted paid advertising campaigns across Google Ads, Facebook, Instagram, and LinkedIn. We create and optimize campaigns that deliver measurable results.",
    aiFeature: "AI-driven bid optimization & audience targeting",
    bgColor: "bg-[#E8F5E9]",
    iconColor: "text-green-600",
    featureColor: "text-green-700",
    link: "/services/ppc",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    description:
      "Build authentic connections and grow your brand presence across all major social platforms. From content creation to community management, we engage audiences and drive conversions.",
    aiFeature: "AI content generation & sentiment analysis",
    bgColor: "bg-[#FCE4EC]",
    iconColor: "text-pink-600",
    featureColor: "text-pink-700",
    link: "/services/smm",
  },
  {
    icon: Mail,
    title: "Email Marketing & Automation",
    description:
      "Nurture leads and retain customers with personalized email campaigns and intelligent automation workflows. We design campaigns that convert prospects into loyal customers.",
    aiFeature: "AI personalization & send-time optimization",
    bgColor: "bg-[#F3E5F5]",
    iconColor: "text-purple-600",
    featureColor: "text-purple-700",
    link: "/services/email-marketing",
  },
  {
    icon: Smartphone,
    title: "App Marketing & ASO",
    description:
      "Launch and grow your mobile app with strategic app store optimization and user acquisition campaigns. We optimize listings and run install campaigns across iOS and Android.",
    aiFeature: "AI-powered ASO & user behavior prediction",
    bgColor: "bg-[#FFFDE7]",
    iconColor: "text-amber-600",
    featureColor: "text-amber-700",
    link: "/services/app-marketing",
  },
  {
    icon: ShoppingCart,
    title: "Marketplace Store Optimization",
    description:
      "Dominate Amazon, Etsy, eBay, and other marketplaces with optimized product listings and strategic advertising. We enhance visibility and increase sales.",
    aiFeature: "AI listing optimization & price intelligence",
    bgColor: "bg-[#F1F8E9]",
    iconColor: "text-lime-600",
    featureColor: "text-lime-700",
    link: "/services/marketplace-optimization",
  },
  {
    icon: Users,
    title: "Affiliate Marketing",
    description:
      "Build and scale revenue through performance-based affiliate partnerships. We recruit affiliates, manage programs, and optimize commissions for sustainable growth.",
    aiFeature: "AI affiliate matching & fraud detection",
    bgColor: "bg-[#E0F2F1]",
    iconColor: "text-teal-600",
    featureColor: "text-teal-700",
    link: "/services/affiliate-marketing",
  },
  {
    icon: TrendingUp,
    title: "Conversion Rate Optimization",
    description:
      "Transform visitors into customers through scientific testing and UX optimization. We analyze behavior and refine your website to maximize conversions and revenue.",
    aiFeature: "AI-powered A/B testing & behavior analysis",
    bgColor: "bg-[#FFF3E0]",
    iconColor: "text-orange-600",
    featureColor: "text-orange-700",
    link: "/services/cro",
  },
  {
    icon: Shield,
    title: "Online Reputation Management",
    description:
      "Protect and enhance your brand's online reputation across review sites, social media, and search results. We monitor mentions and build trust and credibility.",
    aiFeature: "AI sentiment monitoring & response automation",
    bgColor: "bg-[#FFEBEE]",
    iconColor: "text-red-600",
    featureColor: "text-red-700",
    link: "/services/orm",
  },
];

const Services = () => {
  return (
    <section id="services" className="pt-32 pb-24 px-6 bg-gradient-to-b from-[#FDE9DD] to-background">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
          Comprehensive Digital Marketing Solutions
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto text-lg">
          Powered by data and AI automation, our services are designed to drive growth, increase efficiency, and deliver
          measurable ROI.
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
