import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroTeamVisual from "@/assets/hero-team-visual.jpg";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen pt-24 pb-16 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* ✅ LEFT CONTENT — slightly lower now */}
          <div className="space-y-7 animate-fade-in-up self-start mt-8 lg:mt-12">
            {/* Section Tagline */}
            <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              <div className="w-12 h-[2px] bg-primary rounded-full" />
              <span className="text-primary">Digital Marketing & AI Automation</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-glow text-foreground">
              Digital
              <br />
              marketing
            </h1>

            {/* Paragraph */}
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Merge creativity with intelligence. Our AI-driven marketing strategies decode audience behavior, amplify
              your visibility, and deliver unmatched ROI across every digital channel.
            </p>

            {/* CTA Button */}
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 rounded-full px-8 text-base shadow-lg hover:shadow-xl transition-shadow w-fit"
              >
                CONTACT TODAY
              </Button>
            </Link>
          </div>

          {/* ✅ RIGHT IMAGE — unchanged */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[90vw] md:max-w-[500px] lg:max-w-[600px] mx-auto lg:mx-0">
              <div className="absolute inset-0 gradient-bg" />
              <img
                src={heroTeamVisual}
                alt="Hero Visual"
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
