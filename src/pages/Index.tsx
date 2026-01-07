import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Minimize2, 
  ArrowDown, 
  ArrowDownCircle, 
  Image, 
  FileUp, 
  Maximize2, 
  Layers, 
  Scissors, 
  FileText, 
  File,
  Shield,
  Zap,
  Lock
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    }
  }, []);

  const tools = [
    {
      title: "PDF Compressor",
      description: "Reduce PDF file size for email attachments, job applications, and document sharing.",
      icon: Minimize2,
      link: "/pdf-compressor",
      highlight: false,
    },
    {
      title: "Compress to 200KB",
      description: "Compress PDF for Aadhaar card upload, passport applications, and government forms.",
      icon: ArrowDown,
      link: "/compress-pdf-200kb",
      highlight: true,
    },
    {
      title: "Compress to 100KB",
      description: "Maximum compression for strict file size limits on exam forms and online portals.",
      icon: ArrowDownCircle,
      link: "/compress-pdf-100kb",
      highlight: true,
    },
    {
      title: "JPG to PDF",
      description: "Convert photos and scanned documents to PDF format for easy sharing.",
      icon: Image,
      link: "/jpg-to-pdf",
      highlight: false,
    },
    {
      title: "PDF to JPG",
      description: "Extract pages from PDF as high-quality images for presentations and documents.",
      icon: FileUp,
      link: "/pdf-to-jpg",
      highlight: false,
    },
    {
      title: "Image Compressor",
      description: "Optimize JPG and PNG images for web use while maintaining visual quality.",
      icon: Maximize2,
      link: "/image-compressor",
      highlight: false,
    },
    {
      title: "Merge PDF",
      description: "Combine multiple PDF documents into a single file for organized records.",
      icon: Layers,
      link: "/merge-pdf",
      highlight: false,
    },
    {
      title: "Split PDF",
      description: "Extract specific pages or divide large PDFs into smaller documents.",
      icon: Scissors,
      link: "/split-pdf",
      highlight: false,
    },
    {
      title: "Word to PDF",
      description: "Convert Microsoft Word documents to universally compatible PDF format.",
      icon: FileText,
      link: "/word-to-pdf",
      highlight: false,
    },
    {
      title: "PDF to Word",
      description: "Extract text from PDF files into editable Word documents.",
      icon: File,
      link: "/pdf-to-word",
      highlight: false,
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Private",
      description: "All processing happens in your browser. Files never leave your device."
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "No upload delays. Process files immediately with local computation."
    },
    {
      icon: Lock,
      title: "No Account Required",
      description: "Use all tools freely without registration or data collection."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-card border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="container mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
              Document Tools That{" "}
              <span className="text-gradient">Respect Your Privacy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Compress PDFs for government forms, convert documents, and process files—all 
              securely in your browser. No uploads, no accounts, no data collection.
            </p>
            <Button asChild size="lg">
              <a href="#tools">Browse All Tools</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-background">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <main id="tools" className="flex-1 py-16 bg-background">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.link} {...tool} />
          ))}
        </div>
      </main>

      {/* Security */}
      <section id="security" className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Shield className="w-12 h-12 mx-auto mb-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Your Files Stay on Your Device
          </h2>
          <p className="text-muted-foreground">
            All processing happens locally in your browser. No uploads. No tracking.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
