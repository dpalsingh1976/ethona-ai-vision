import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import testimonialBg from "@/assets/testimonial-bg.jpg";

const testimonials = [
  {
    text: "Ea pro tibique comprehensam, sed ea verear numquam molestie. Ex vel populo appellantur. Eos ne delenit admodum.",
    author: "Sarah Johnson",
    role: "CEO, TechStart Inc",
  },
  {
    text: "Working with Ethona Digital Lab transformed our online presence. Their AI-driven strategies delivered results beyond our expectations.",
    author: "Michael Chen",
    role: "Marketing Director, GrowthCo",
  },
  {
    text: "The team's expertise in digital marketing and automation helped us scale efficiently. Highly recommended for any growing business.",
    author: "Emily Rodriguez",
    role: "Founder, Creative Agency",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${testimonialBg})`,
        }}
      >
        <div className="absolute inset-0 bg-primary/90" />
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <p className="text-sm font-medium uppercase tracking-wider mb-4 opacity-80">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">What People Say</h2>
          
          <div className="space-y-8">
            <p className="text-xl md:text-2xl italic leading-relaxed">
              "{testimonials[currentIndex].text}"
            </p>
            
            <div>
              <p className="font-semibold text-lg">{testimonials[currentIndex].author}</p>
              <p className="text-sm opacity-80">{testimonials[currentIndex].role}</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "bg-primary-foreground w-8" : "bg-primary-foreground/40"
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="rounded-full bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="rounded-full bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
