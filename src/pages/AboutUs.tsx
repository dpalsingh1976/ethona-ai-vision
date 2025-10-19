import { Target, Eye, Users, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">About Ethona Digital Lab</h1>
          <p className="text-xl text-muted-foreground">Where Strategy Meets AI</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#FFF8EE] to-background">
        <div className="container mx-auto max-w-4xl">
          <p className="text-lg leading-relaxed text-foreground mb-6">
            Ethona Digital Lab delivers innovative Digital Marketing and AI Automation solutions that empower businesses to grow smarter. 
            We blend creativity with technology to drive measurable results through SEO, PPC, Social Media, and intelligent automation workflows.
          </p>
          <p className="text-lg leading-relaxed text-foreground">
            Our mission is to help brands evolve digitally — turning marketing strategies into automated, high-performing ecosystems.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-card p-10 rounded-3xl shadow-card hover:shadow-hover transition-shadow">
              <Target className="w-14 h-14 text-primary mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower businesses with cutting-edge digital marketing and AI-driven automation that delivers measurable growth and sustainable competitive advantage.
              </p>
            </div>
            
            <div className="bg-card p-10 rounded-3xl shadow-card hover:shadow-hover transition-shadow">
              <Eye className="w-14 h-14 text-primary mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To be the global leader in intelligent marketing automation, where every brand we work with becomes a digitally-evolved, data-driven powerhouse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-[#FFF8EE]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Lightbulb, title: "Innovation", desc: "Pushing boundaries with cutting-edge solutions" },
              { icon: Target, title: "Results-Driven", desc: "Focused on measurable outcomes and ROI" },
              { icon: Eye, title: "Transparency", desc: "Clear communication and honest partnerships" },
              { icon: Users, title: "Client Partnership", desc: "Your success is our success" }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                  <value.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
