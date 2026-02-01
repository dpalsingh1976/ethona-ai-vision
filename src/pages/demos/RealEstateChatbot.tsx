import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Building2, Bot, MessageSquare, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RealEstateChatbot = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.onload = () => {
      (window as any).voiceflow.chat.load({
        verify: { projectID: "697f50bbd132dfbc82562a8f" },
        url: "https://general-runtime.voiceflow.com",
        versionID: "production",
        voice: {
          url: "https://runtime-api.voiceflow.com",
        },
      });
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if ((window as any).voiceflow?.chat?.destroy) {
        (window as any).voiceflow.chat.destroy();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Property Inquiries",
      description: "Handles questions about listings, pricing, and availability",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Scheduling",
      description: "Books property viewings and follow-up appointments",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Lead Qualification",
      description: "Qualifies prospects and captures contact information",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-blue-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Link */}
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Demos
          </Link>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Real Estate AI Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Real Estate AI Chatbot</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience our intelligent chatbot designed specifically for real estate agents. Click the chat icon in
              the bottom-right corner to start a conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30 flex-grow">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">What This Chatbot Can Do</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Instructions Card */}
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 border border-sky-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Try It Now</h3>
                <p className="text-muted-foreground mb-4">
                  Look for the chat widget in the bottom-right corner of this page. Click on it to start interacting
                  with our Real Estate AI assistant.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try asking about property listings, scheduling a viewing, or any real estate related questions!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Want This for Your Business?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            We can build a custom AI chatbot tailored to your real estate business needs.
          </p>
          <Button asChild size="lg" className="bg-sky-600 hover:bg-sky-700">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RealEstateChatbot;
