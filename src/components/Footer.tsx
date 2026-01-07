import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">DocFlow</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Professional document processing tools that work entirely in your browser. 
              No file uploads, no data collection—complete privacy guaranteed.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">PDF Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pdf-compressor" className="text-muted-foreground hover:text-foreground transition-colors">
                  PDF Compressor
                </Link>
              </li>
              <li>
                <Link to="/compress-pdf-200kb" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compress to 200KB
                </Link>
              </li>
              <li>
                <Link to="/merge-pdf" className="text-muted-foreground hover:text-foreground transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link to="/split-pdf" className="text-muted-foreground hover:text-foreground transition-colors">
                  Split PDF
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Converters</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jpg-to-pdf" className="text-muted-foreground hover:text-foreground transition-colors">
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link to="/pdf-to-jpg" className="text-muted-foreground hover:text-foreground transition-colors">
                  PDF to JPG
                </Link>
              </li>
              <li>
                <Link to="/word-to-pdf" className="text-muted-foreground hover:text-foreground transition-colors">
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link to="/pdf-to-word" className="text-muted-foreground hover:text-foreground transition-colors">
                  PDF to Word
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 DocFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
