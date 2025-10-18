import { Card } from "@/components/ui/card";
import { Search, ThumbsUp, BarChart3 } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Search Engine Optimization",
    description: "Maecenas elementum sapien in metus placerat finibus.",
    color: "from-cyan-100 to-blue-100",
    iconColor: "text-cyan-600",
  },
  {
    icon: ThumbsUp,
    title: "Social Media Strategy",
    description: "Maecenas elementum sapien in metus placerat finibus.",
    color: "from-pink-100 to-rose-100",
    iconColor: "text-pink-600",
  },
  {
    icon: BarChart3,
    title: "Reporting & Analysis",
    description: "Maecenas elementum sapien in metus placerat finibus.",
    color: "from-yellow-100 to-orange-100",
    iconColor: "text-orange-600",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Conversion Rate Increased
          </p>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Happy Ewebot Customers
          </p>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Amount of Investments in 2022
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-8 bg-card hover:shadow-hover transition-all duration-300 border-none rounded-3xl group cursor-pointer transform hover:-translate-y-2"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={`w-10 h-10 ${service.iconColor}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
