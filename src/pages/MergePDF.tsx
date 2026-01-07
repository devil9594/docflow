import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Combine Multiple PDFs Into One Document
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Merge multiple PDF files into a single document for easier organization 
        and sharing. Perfect for combining scanned pages, creating document packages, 
        or consolidating reports.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Combine multiple scanned pages into one document</li>
        <li>• Merge contract pages from different sources</li>
        <li>• Create document packages for submissions</li>
        <li>• Consolidate monthly reports into annual documents</li>
        <li>• Combine multiple invoices for records</li>
      </ul>
    </section>
  </div>
);

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Need more files",
        description: "Please upload at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as BlobPart], { type: "application/pdf" });
      
      saveAs(blob, "merged.pdf");
      
      toast({
        title: "PDFs Merged",
        description: `Combined ${files.length} PDF files.`,
      });
      
      setFiles([]);
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "There was an error merging your PDFs.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF documents into a single file."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground mb-1">
                  Click to add PDF files
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload multiple PDFs to merge them
                </p>
              </div>
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground text-sm">
              Files to merge ({files.length}):
            </h3>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={mergePDFs}
          disabled={files.length < 2 || processing}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Merging PDFs...
            </>
          ) : (
            `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`
          )}
        </Button>
      </div>
    </ToolLayout>
  );
};

export default MergePDF;
