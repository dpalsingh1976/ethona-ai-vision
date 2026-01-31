import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ExternalLink, Monitor, Sparkles, Building2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const webDemos = [
  {
    name: "Serenity Wellness",
    description: "A calming wellness spa website with appointment booking and service showcase.",
    url: "https://serenitywellness.manus.space/",
    gradient: "from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    name: "Chiropractor Care",
    description: "Professional chiropractic clinic website with patient intake and service information.",
    url: "https://chiropractorcare.manus.space/",
    gradient: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    name: "DocIntake",
    description: "Streamlined medical intake form system for healthcare providers.",
    url: "https://docintake.manus.space",
    gradient: "from-purple-50 to-pink-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

const realEstateDemos = [
  {
    name: "Real Estate AI Chatbot",
    description: "Interactive AI-powered chatbot designed for real estate agents. Handles property inquiries, scheduling, and client engagement.",
    path: "/demo/real-estate-chatbot",
    gradient: "from-sky-50 to-blue-50",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
];

const Demo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Live Demonstrations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Demo Projects
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our live demo projects showcasing our web development capabilities 
            and design expertise across different industries.
          </p>
        </div>
      </section>

      {/* Web Development Demos Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8 max-w-5xl mx-auto">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Web Development</h2>
              <p className="text-muted-foreground">{webDemos.length} Demos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {webDemos.map((demo, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${demo.gradient} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/50`}
              >
                <div className={`w-12 h-12 ${demo.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <Monitor className={`w-6 h-6 ${demo.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {demo.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {demo.description}
                </p>
                <Button
                  asChild
                  className="w-full group-hover:bg-primary/90 transition-colors"
                >
                  <a
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    View Demo
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Estate AI Demos Section */}
      <section className="py-16 bg-muted/30 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8 max-w-5xl mx-auto">
            <div className="p-3 rounded-xl bg-sky-100 text-sky-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Real Estate AI</h2>
              <p className="text-muted-foreground">{realEstateDemos.length} Demo</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {realEstateDemos.map((demo, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${demo.gradient} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-sky-100`}
              >
                <div className={`w-12 h-12 ${demo.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <Bot className={`w-6 h-6 ${demo.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {demo.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {demo.description}
                </p>
                <Button
                  asChild
                  className="w-full bg-sky-600 hover:bg-sky-700 transition-colors"
                >
                  <Link
                    to={demo.path}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    Try Chatbot
                    <Bot className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-center text-sm text-muted-foreground mt-12 max-w-lg mx-auto">
            These are demonstration projects created to showcase our capabilities. 
            They may contain placeholder content and limited functionality.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Demo;
