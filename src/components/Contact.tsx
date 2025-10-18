import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute -left-12 top-0 w-32 h-32 opacity-20 animate-float">
                <Send className="w-full h-full text-primary" strokeWidth={1} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight relative z-10">
                Want to WOW Your Customers?
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Let's discuss how we can help transform your digital presence with cutting-edge marketing strategies and AI automation.
            </p>
          </div>
          
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Your Name*"
                    className="border-border rounded-xl bg-background"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email*"
                    className="border-border rounded-xl bg-background"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Phone"
                    className="border-border rounded-xl bg-background"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Website*"
                    className="border-border rounded-xl bg-background"
                  />
                </div>
              </div>
              
              <div>
                <Textarea
                  placeholder="Message*"
                  rows={4}
                  className="border-border rounded-xl bg-background resize-none"
                />
              </div>
              
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 rounded-full text-base"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
