import { Button } from "@/components/ui/button";
import heroPerson1 from "@/assets/hero-person-1.jpg";
import heroPerson2 from "@/assets/hero-person-2.jpg";
import heroPerson3 from "@/assets/hero-person-3.jpg";

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
          
          <div className="relative h-[600px]">
            {/* Person 1 - Top right with subtle rotation */}
            <div className="absolute top-0 right-12 w-56 h-56 rounded-3xl overflow-hidden shadow-card transform hover:scale-105 transition-all duration-300 rotate-3 animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
              <img src={heroPerson1} alt="Happy team member" className="w-full h-full object-cover" />
            </div>
            
            {/* Person 2 - Middle left with opposite rotation */}
            <div className="absolute top-48 left-0 w-48 h-48 rounded-3xl overflow-hidden shadow-card transform hover:scale-105 transition-all duration-300 -rotate-2 animate-fade-in" style={{ animationDelay: '1.2s', opacity: 0 }}>
              <img src={heroPerson2} alt="Thoughtful team member" className="w-full h-full object-cover" />
            </div>
            
            {/* Person 3 - Bottom right with subtle rotation */}
            <div className="absolute bottom-12 right-0 w-52 h-52 rounded-3xl overflow-hidden shadow-card transform hover:scale-105 transition-all duration-300 rotate-2 animate-fade-in" style={{ animationDelay: '1.8s', opacity: 0 }}>
              <img src={heroPerson3} alt="Professional team member" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
