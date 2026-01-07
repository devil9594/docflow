import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              DocFlow
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Tools
            </Link>
            <a 
              href="#features" 
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Features
            </a>
            <a 
              href="#security" 
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Security
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
