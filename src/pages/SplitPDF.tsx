import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Extract Specific Pages from PDF Documents
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Split large PDF files into smaller documents by extracting specific pages 
        or page ranges. Perfect for extracting individual certificates, specific 
        report sections, or creating document subsets.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Extract specific pages from large documents</li>
        <li>• Separate multi-page scans into individual files</li>
        <li>• Extract certificate pages from combined documents</li>
        <li>• Create document subsets for sharing</li>
        <li>• Split reports into chapters or sections</li>
      </ul>
    </section>
  </div>
);

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitRanges, setSplitRanges] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    setPageCount(pdfDoc.getPageCount());
  };

  const splitPDF = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const ranges = splitRanges.split(",").map(r => r.trim());
      
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const newPdf = await PDFDocument.create();
        
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(n => parseInt(n) - 1);
          for (let pageNum = start; pageNum <= end; pageNum++) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
            newPdf.addPage(copiedPage);
          }
        } else {
          const pageNum = parseInt(range) - 1;
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
          newPdf.addPage(copiedPage);
        }
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
        saveAs(blob, `split_${i + 1}_${file.name}`);
      }
      
      toast({
        title: "PDF Split Complete",
        description: `Created ${ranges.length} new PDF file(s).`,
      });
    } catch (error) {
      toast({
        title: "Split Failed",
        description: "Check your page ranges and try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages or divide large PDFs into smaller documents."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf"
          maxSize={50}
        />
        
        {pageCount > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total pages: <strong className="text-foreground">{pageCount}</strong>
            </p>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Page Ranges to Extract
              </label>
              <Input
                type="text"
                placeholder="e.g., 1-3, 5, 7-9"
                value={splitRanges}
                onChange={(e) => setSplitRanges(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate ranges with commas. Use hyphens for ranges (e.g., "1-3,5,7-9")
              </p>
            </div>
            
            <Button
              onClick={splitPDF}
              disabled={!splitRanges || processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Splitting PDF...
                </>
              ) : (
                "Split PDF"
              )}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SplitPDF;
