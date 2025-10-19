import { Button } from "@/components/ui/button";
import heroTeamVisual from "@/assets/hero-team-visual.jpg";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen pt-24 pb-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <div className="w-12 h-[2px] bg-primary" />
                DIGITAL MARKETING & AI AUTOMATION
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-glow">
              Digital
              <br />
              marketing
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Extract real business value from social media. Ensuring the best return on investment for your bespoke SEO
              campaign requirement.
            </p>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8 text-base shadow-lg hover:shadow-xl transition-shadow"
            >
              CONTACT TODAY
            </Button>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[90vw] md:max-w-[500px] lg:max-w-[600px] mx-auto lg:mx-0">
              {/* Background matching hero gradient - fills transparent areas */}
              <div className="absolute inset-0 gradient-bg" />

              {/* Image with gradient background showing through transparent areas */}
              <img
                src={heroTeamVisual}
                alt="..."
                className="relative w-full h-auto object-contain"
                style={{
                  mixBlendMode: "multiply",
                  filter: "brightness(1.1) saturate(0.8)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
