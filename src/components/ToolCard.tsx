import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  highlight?: boolean;
}

const ToolCard = ({ title, description, icon: Icon, link, highlight }: ToolCardProps) => {
  return (
    <Link 
      to={link}
      className="group relative bg-card rounded-lg p-6 transition-all duration-300 hover:bg-card/80 border border-border hover:border-primary/50 flex flex-col"
    >
      <div className={`
        w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors
        ${highlight 
          ? 'bg-accent/20 text-accent group-hover:bg-accent group-hover:text-accent-foreground' 
          : 'bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
        }
      `}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed flex-1">
        {description}
      </p>
      
      <div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Open tool</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

export default ToolCard;
