import { Button } from "@/components/ui/button";
import caseStudy1 from "@/assets/case-study-1.jpg";
import caseStudy2 from "@/assets/case-study-2.jpg";

const CaseStudies = () => {
  return (
    <section id="cases" className="py-24 px-6 bg-primary text-primary-foreground">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-wider opacity-80">
              Our Case Studies
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Our Case Studies
            </h2>
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                className="text-sm px-6 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 rounded-full"
              >
                Marketing
              </Button>
              <Button
                variant="outline"
                className="text-sm px-6 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 rounded-full"
              >
                Business
              </Button>
              <Button
                variant="outline"
                className="text-sm px-6 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 rounded-full"
              >
                SEO
              </Button>
            </div>
            <Button className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-8">
              VIEW ALL CASES
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded-3xl overflow-hidden shadow-hover transform hover:scale-105 transition-transform duration-300">
                <img src={caseStudy1} alt="Agency Optimization" className="w-full h-64 object-cover" />
                <div className="p-6 bg-card text-card-foreground">
                  <p className="text-sm font-medium mb-2">Agency Optimization</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 pt-12">
              <div className="rounded-3xl overflow-hidden shadow-hover transform hover:scale-105 transition-transform duration-300">
                <img src={caseStudy2} alt="Online Management" className="w-full h-64 object-cover" />
                <div className="p-6 bg-card text-card-foreground">
                  <p className="text-sm font-medium mb-2">Online Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
