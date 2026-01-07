import { useState } from "react";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Convert Word Documents to PDF Format
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Transform Microsoft Word documents into universally compatible PDF format. 
        Perfect for sharing documents that need to look the same on any device 
        without requiring Word software.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Convert resumes and CVs to PDF for job applications</li>
        <li>• Create PDF versions of reports and proposals</li>
        <li>• Convert cover letters to PDF format</li>
        <li>• Create shareable PDF documents from Word files</li>
        <li>• Convert legal documents to PDF for signing</li>
      </ul>
    </section>
  </div>
);

const WordToPDF = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToPDF = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.cssText = `
        width: 595px;
        padding: 40px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.6;
        position: absolute;
        left: -9999px;
        background: white;
      `;
      document.body.appendChild(container);
      
      const styles = document.createElement('style');
      styles.textContent = `
        h1 { font-size: 24px; margin: 20px 0 10px; }
        h2 { font-size: 20px; margin: 18px 0 8px; }
        h3 { font-size: 16px; margin: 16px 0 6px; }
        p { margin: 8px 0; }
        ul, ol { margin: 8px 0; padding-left: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
      `;
      container.appendChild(styles);
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const text = container.innerText;
      const lines = doc.splitTextToSize(text, 515);
      
      const pageHeight = 842;
      const margin = 40;
      const lineHeight = 14;
      let y = margin;
      
      lines.forEach((line: string) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      
      document.body.removeChild(container);
      
      const blob = doc.output('blob');
      const fileName = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
      saveAs(blob, fileName);
      
      toast({
        title: "Conversion Complete",
        description: `${file.name} has been converted to PDF.`,
      });
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: "Make sure it's a valid .docx file.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Microsoft Word documents to universally compatible PDF format."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={convertToPDF}
          accept=".docx,.doc"
          maxSize={20}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Converting to PDF...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Supported formats:</strong> .docx files (Microsoft Word 2007+)</p>
          <p className="mt-2">
            <strong className="text-foreground">Note:</strong> Complex formatting may not be preserved exactly. 
            Works best with simple document formatting.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default WordToPDF;
