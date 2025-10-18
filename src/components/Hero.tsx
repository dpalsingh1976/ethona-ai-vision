import { Button } from "@/components/ui/button";
import { Lightbulb, Rocket } from "lucide-react";
import heroPortrait1 from "@/assets/hero-portrait-1.jpg";
import heroPortrait2 from "@/assets/hero-portrait-2.jpg";
import heroPortrait3 from "@/assets/hero-portrait-3.jpg";
import heroPortrait4 from "@/assets/hero-portrait-4.jpg";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen pt-24 pb-16 px-6 relative overflow-hidden bg-gradient-to-br from-[#f5f1e8] via-[#faf8f3] to-[#f0ebe0]">
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <div className="w-12 h-[2px] bg-primary" />
                DIGITAL MARKETING & AI AUTOMATION
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
              Ethona Digital Lab
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground/80">
              Where Intelligence Creates
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Where strategy meets automation and ideas become revenue.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white rounded-full px-8 text-base shadow-lg">
                Get a Demo
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base border-2 border-foreground/20 hover:bg-foreground/5">
                See How It Works
              </Button>
            </div>
          </div>
          
          {/* Right Side - Creative Portrait Layout */}
          <div className="relative h-[600px]">
            {/* SVG Dashed Lines Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 600">
              <defs>
                <filter id="soften">
                  <feGaussianBlur stdDeviation="0.5"/>
                </filter>
              </defs>
              
              {/* Dashed connecting lines */}
              <path
                d="M 100 100 Q 200 150, 350 120"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-draw-line"
                filter="url(#soften)"
              />
              <path
                d="M 100 100 Q 50 250, 120 380"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-draw-line"
                style={{ animationDelay: '0.3s' }}
                filter="url(#soften)"
              />
              <path
                d="M 350 120 Q 400 250, 380 480"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-draw-line"
                style={{ animationDelay: '0.6s' }}
                filter="url(#soften)"
              />
              <path
                d="M 120 380 Q 250 430, 380 480"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-draw-line"
                style={{ animationDelay: '0.9s' }}
                filter="url(#soften)"
              />
              
              {/* Squiggly decorative lines */}
              <path
                d="M 50 50 Q 60 45, 70 50 Q 80 55, 90 50"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-float-icon"
              />
              <path
                d="M 420 550 Q 430 545, 440 550 Q 450 555, 460 550"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-float-icon"
                style={{ animationDelay: '0.5s' }}
              />
            </svg>
            
            {/* Portrait 1 - Top Left (Orange background) */}
            <div className="absolute top-10 left-10 w-44 h-44 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 -rotate-3 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <img src={heroPortrait1} alt="Team member with creative energy" className="w-full h-full object-cover" />
            </div>
            
            {/* Portrait 2 - Top Right (Teal background) */}
            <div className="absolute top-20 right-20 w-52 h-52 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 rotate-2 animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
              <img src={heroPortrait2} alt="Thoughtful team strategist" className="w-full h-full object-cover" />
            </div>
            
            {/* Portrait 3 - Bottom Left (Pink background) */}
            <div className="absolute bottom-24 left-16 w-48 h-48 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 rotate-1 animate-fade-in" style={{ animationDelay: '0.8s', opacity: 0 }}>
              <img src={heroPortrait3} alt="Creative professional" className="w-full h-full object-cover" />
            </div>
            
            {/* Portrait 4 - Bottom Right (Purple background) */}
            <div className="absolute bottom-16 right-12 w-46 h-46 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 -rotate-2 animate-fade-in" style={{ animationDelay: '1.1s', opacity: 0 }}>
              <img src={heroPortrait4} alt="Innovative team member" className="w-full h-full object-cover" />
            </div>
            
            {/* Hand-drawn Icons */}
            <div className="absolute bottom-12 left-4 w-10 h-10 text-[#2c2c2c] animate-float-icon" style={{ animationDelay: '0.2s' }}>
              <Lightbulb className="w-full h-full" strokeWidth={1.5} />
            </div>
            
            <div className="absolute top-40 right-4 w-10 h-10 text-[#2c2c2c] animate-float-icon" style={{ animationDelay: '0.7s' }}>
              <Rocket className="w-full h-full" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
