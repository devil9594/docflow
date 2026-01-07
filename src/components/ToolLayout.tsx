import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Button } from "./ui/button";

interface ToolLayoutProps {
  title: string;
  description: string;
  seoContent?: ReactNode;
  children: ReactNode;
}

const ToolLayout = ({ title, description, seoContent, children }: ToolLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <Button
            asChild
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All tools
            </Link>
          </Button>
          
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-6 md:p-8 mb-10">
            {children}
          </div>
          
          {seoContent && (
            <div className="prose prose-invert max-w-none">
              {seoContent}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ToolLayout;
