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
              Extract real business value from social media. Ensuring the best return on investment for your bespoke SEO campaign requirement.
            </p>
            
            <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 text-base shadow-lg hover:shadow-xl transition-shadow">
              CONTACT TODAY
            </Button>
          </div>
          
          <div className="relative flex items-center justify-center lg:justify-end px-4 md:px-6 lg:px-0 lg:pl-12">
            <div className="relative w-full max-w-[90vw] md:max-w-[500px] lg:max-w-[650px] mx-auto lg:mx-0 lg:ml-auto">
              {/* Soft glow background that blends with hero gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FDE9DD]/30 via-transparent to-[#FFF8EE]/20 blur-3xl scale-110 -z-10" />
              
              {/* Animated light sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent blur-2xl -z-10 animate-gradient-sweep" />
              
              {/* Main image with parallax animation and soft blending */}
              <div className="relative animate-parallax">
                <img 
                  src={heroTeamVisual} 
                  alt="Digital marketing team connected through social media platforms including Facebook, Instagram, Twitter, LinkedIn and TikTok" 
                  className="w-full h-auto object-contain mix-blend-normal"
                  style={{
                    filter: 'drop-shadow(0 20px 60px rgba(253, 233, 221, 0.3)) drop-shadow(0 10px 30px rgba(255, 248, 238, 0.2))',
                  }}
                />
              </div>
              
              {/* Subtle radial glow overlay for edge blending */}
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#FFF8EE]/40 pointer-events-none" 
                   style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(255, 248, 238, 0.3) 100%)' }} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
