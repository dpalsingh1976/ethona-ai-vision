import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  colorFrom: string;
  colorTo: string;
  iconColor: string;
}

const ServiceCard = ({ icon: Icon, title, description, link, colorFrom, colorTo, iconColor }: ServiceCardProps) => {
  return (
    <Link to={link} className="block">
      <Card className="p-8 bg-card hover:shadow-hover transition-all duration-300 border-none rounded-3xl group cursor-pointer transform hover:-translate-y-2 h-full">
        <div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-10 h-10 ${iconColor}`} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
        <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
          Learn More <ArrowRight className="w-4 h-4" />
        </div>
      </Card>
    </Link>
  );
};

export default ServiceCard;
