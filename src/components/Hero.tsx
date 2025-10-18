import { Button } from "@/components/ui/button";
import heroTeamVisual from "@/assets/hero-team-visual.png";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen pt-24 pb-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-30" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <div className="w-12 h-[2px] bg-primary" />
                DIGITAL MARKETING & AI AUTOMATION
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Digital
              <br />
              marketing
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Extract real business value from social media. Ensuring the best return on investment for your bespoke SEO campaign requirement.
            </p>
            
            <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 text-base">
              CONTACT TODAY
            </Button>
          </div>
          
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[600px] animate-fade-in">
              <img 
                src={heroTeamVisual} 
                alt="Creative team collaboration with connected ideas" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
