import { useState } from "react";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/components/useSEO";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Convert Word Documents to PDF Online
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Convert Microsoft Word documents (.docx) into PDF format instantly.
        Ideal for resumes, reports, applications, and official documents that
        must look the same on all devices.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Word to PDF Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Convert resumes and CVs to PDF for job applications</li>
        <li>• Create PDF versions of reports and proposals</li>
        <li>• Convert cover letters and assignments to PDF</li>
        <li>• Create shareable PDFs from Word documents</li>
        <li>• Convert legal and business documents to PDF</li>
      </ul>
    </section>
  </div>
);

const WordToPDF = () => {
  useSEO({
    title: "Word to PDF Converter Online | Convert DOCX to PDF Free",
    description:
      "Convert Word documents to PDF online for free. Fast, secure Word to PDF converter that works directly in your browser without uploads.",
    canonical: "/word-to-pdf",
  });

  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToPDF = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();

      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      const container = document.createElement("div");
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

      const styles = document.createElement("style");
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
        orientation: "portrait",
        unit: "pt",
        format: "a4",
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

      const blob = doc.output("blob");
      const fileName = file.name.replace(/\.(docx?|doc)$/i, ".pdf");
      saveAs(blob, fileName);

      toast({
        title: "Conversion Complete",
        description: `${file.name} has been converted to PDF.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: "Make sure the file is a valid .docx document.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Microsoft Word documents to PDF format online."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={convertToPDF} accept=".docx,.doc" maxSize={20} />

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Converting Word to PDF…</p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Supported:</strong> .docx files
            (Word 2007+)
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Note:</strong> Complex layouts may
            not be preserved perfectly. Best for text-based documents.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default WordToPDF;
