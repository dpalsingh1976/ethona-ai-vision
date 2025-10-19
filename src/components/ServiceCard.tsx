import { LucideIcon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  aiFeature: string;
  bgColor: string;
  iconColor: string;
  featureColor: string;
  link: string;
}

const ServiceCard = ({ icon: Icon, title, description, aiFeature, bgColor, iconColor, featureColor, link }: ServiceCardProps) => {
  return (
    <Link to={link} className="block">
      <Card className={`${bgColor} p-8 border-2 border-gray-200 rounded-3xl hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 h-full relative`}>
        {/* Decorative dot - top right */}
        <div className="absolute top-6 right-6 w-2 h-2 bg-gray-400 rounded-full"></div>
        
        {/* Icon circle - white background */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Icon className={`w-8 h-8 ${iconColor}`} strokeWidth={2} />
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
        
        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-6 text-base">{description}</p>
        
        {/* AI Feature callout */}
        <div className="flex items-center gap-2 mt-auto">
          <Sparkles className={`w-4 h-4 ${featureColor}`} />
          <span className={`text-sm font-medium ${featureColor}`}>{aiFeature}</span>
        </div>
      </Card>
    </Link>
  );
};

export default ServiceCard;
