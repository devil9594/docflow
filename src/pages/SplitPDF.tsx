import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/components/useSEO";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Split PDF Files and Extract Specific Pages
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Split large PDF documents into smaller files by extracting selected pages
        or page ranges. This tool works entirely in your browser and keeps your
        documents private.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common PDF Splitting Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Extract certificate pages from multi-page PDFs</li>
        <li>• Split scanned documents into separate files</li>
        <li>• Create smaller PDFs for sharing or uploading</li>
        <li>• Extract specific chapters from reports</li>
        <li>• Divide large PDFs into manageable sections</li>
      </ul>
    </section>
  </div>
);

const SplitPDF = () => {
  useSEO({
    title: "Split PDF Online | Extract Pages from PDF for Free",
    description:
      "Split PDF files online and extract specific pages or page ranges. Free, fast, and secure PDF splitter that works directly in your browser.",
    canonical: "/split-pdf",
  });

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

      const ranges = splitRanges
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const newPdf = await PDFDocument.create();

        if (range.includes("-")) {
          const [start, end] = range
            .split("-")
            .map((n) => parseInt(n, 10) - 1);

          if (start < 0 || end >= pageCount || start > end) {
            throw new Error("Invalid page range");
          }

          for (let pageNum = start; pageNum <= end; pageNum++) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
            newPdf.addPage(copiedPage);
          }
        } else {
          const pageNum = parseInt(range, 10) - 1;
          if (pageNum < 0 || pageNum >= pageCount) {
            throw new Error("Invalid page number");
          }

          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as BlobPart], {
          type: "application/pdf",
        });

        saveAs(blob, `split_${i + 1}_${file.name}`);
      }

      toast({
        title: "PDF Split Complete",
        description: `Created ${ranges.length} new PDF file(s).`,
      });
    } catch (error) {
      toast({
        title: "Split Failed",
        description:
          "Please check your page numbers and ranges and try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages or divide large PDF files into smaller documents."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={handleFileSelect} accept=".pdf" maxSize={50} />

        {pageCount > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total pages:{" "}
              <strong className="text-foreground">{pageCount}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Page Ranges to Extract
              </label>
              <Input
                type="text"
                placeholder="e.g. 1-3, 5, 7-9"
                value={splitRanges}
                onChange={(e) => setSplitRanges(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate ranges with commas. Use hyphens for ranges.
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
                  Splitting PDF…
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
