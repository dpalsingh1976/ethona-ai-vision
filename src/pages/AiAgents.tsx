import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Bot, MessageSquare, FileText, Home, DollarSign, Wrench, Users, ClipboardList, Key, HelpCircle, Star, ShoppingCart, BarChart3, RefreshCw, Calendar, FileCheck, Building, Package } from "lucide-react";

interface Agent {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
  };
  agents: Agent[];
}

const agentsData: Category[] = [
  {
    id: "realestate",
    name: "Real Estate",
    icon: <Building2 className="w-6 h-6" />,
    color: {
      bg: "from-sky-50 to-blue-50",
      border: "border-sky-200",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    },
    agents: [
      {
        name: "Real Estate Consultant AI Agent",
        description: "Expert guidance on property investments, market trends, and real estate strategies for buyers and sellers.",
        icon: <Bot className="w-5 h-5" />,
      },
      {
        name: "Real Estate AI Chatbot Template",
        description: "Customizable chatbot foundation for real estate websites with property search and inquiry handling.",
        icon: <MessageSquare className="w-5 h-5" />,
      },
      {
        name: "Property Inquiry AI Agent",
        description: "Handles initial property inquiries, answers questions, and qualifies potential buyers or renters.",
        icon: <HelpCircle className="w-5 h-5" />,
      },
      {
        name: "Real Estate Listing AI Agent",
        description: "Creates compelling property listings with optimized descriptions and feature highlights.",
        icon: <FileText className="w-5 h-5" />,
      },
      {
        name: "Home Loan Application AI Agent",
        description: "Guides users through mortgage applications, calculates affordability, and explains loan options.",
        icon: <DollarSign className="w-5 h-5" />,
      },
      {
        name: "House Seller AI Agent",
        description: "Assists homeowners in preparing their property for sale with pricing and staging recommendations.",
        icon: <Home className="w-5 h-5" />,
      },
      {
        name: "Property Maintenance Request AI Agent",
        description: "Streamlines maintenance requests, prioritizes issues, and coordinates with service providers.",
        icon: <Wrench className="w-5 h-5" />,
      },
      {
        name: "Rental Application AI Agent",
        description: "Processes rental applications, collects background information, and screens potential tenants.",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Real Estate Client Registration AI Agent",
        description: "Onboards new clients, collects preferences, and creates personalized property search profiles.",
        icon: <ClipboardList className="w-5 h-5" />,
      },
      {
        name: "Apartment Lease Agreement AI Agent",
        description: "Generates and explains lease agreements, handles tenant questions about terms and conditions.",
        icon: <Key className="w-5 h-5" />,
      },
      {
        name: "Real Estate Applicant Questionnaire AI Agent",
        description: "Conducts comprehensive applicant interviews to match clients with ideal properties.",
        icon: <HelpCircle className="w-5 h-5" />,
      },
      {
        name: "Real Estate Agent Feedback AI Agent",
        description: "Collects and analyzes feedback from clients to improve agent performance and service quality.",
        icon: <Star className="w-5 h-5" />,
      },
      {
        name: "Offer To Purchase Real Estate AI Agent",
        description: "Guides buyers through creating competitive purchase offers with market-based recommendations.",
        icon: <ShoppingCart className="w-5 h-5" />,
      },
      {
        name: "Real Estate Evaluation AI Agent",
        description: "Provides property valuations using market data, comparables, and location analysis.",
        icon: <BarChart3 className="w-5 h-5" />,
      },
      {
        name: "Realtor Transaction AI Agent",
        description: "Manages real estate transactions from offer to closing with timeline and document tracking.",
        icon: <RefreshCw className="w-5 h-5" />,
      },
      {
        name: "Real Estate Open House Feedback AI Agent",
        description: "Captures visitor feedback during open houses and follows up with interested prospects.",
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        name: "Real Estate Lease Agreement AI Agent",
        description: "Creates customized commercial and residential lease agreements with legal compliance.",
        icon: <FileCheck className="w-5 h-5" />,
      },
      {
        name: "Real Estate Development Information AI Agent",
        description: "Provides insights on new developments, construction timelines, and investment opportunities.",
        icon: <Building className="w-5 h-5" />,
      },
      {
        name: "Property Purchase Order AI Agent",
        description: "Streamlines the purchase order process with automated documentation and approval workflows.",
        icon: <Package className="w-5 h-5" />,
      },
    ],
  },
];

const AiAgents = () => {
  const totalAgents = agentsData.reduce((sum, cat) => sum + cat.agents.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              AI-Powered Solutions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              AI Agents
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover our collection of {totalAgents}+ intelligent AI agents designed to automate 
              and enhance your business operations across multiple industries.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          {agentsData.map((category) => (
            <div key={category.id} className="mb-16 last:mb-0">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-xl ${category.color.iconBg} ${category.color.iconColor}`}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {category.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {category.agents.length} AI Agents
                  </p>
                </div>
              </div>

              {/* Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.agents.map((agent, index) => (
                  <div
                    key={index}
                    className={`group relative p-6 rounded-2xl bg-gradient-to-br ${category.color.bg} ${category.color.border} border hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${category.color.iconBg} ${category.color.iconColor} flex items-center justify-center mb-4`}>
                      {agent.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {agent.description}
                    </p>
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Need a Custom AI Agent?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We build tailored AI solutions for your specific business needs. 
            Let's discuss how we can automate your workflows.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AiAgents;
