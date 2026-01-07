import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/components/useSEO";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Compress PDF to 100KB for Strict Upload Limits
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Many government portals, exam forms, and scholarship applications enforce a
        strict 100KB PDF size limit. This tool applies maximum compression to help you
        meet those requirements while preserving readability.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        When You Need to Compress PDF to 100KB
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Compress PDF to 100KB for exam form submissions</li>
        <li>• Reduce PDF size for scholarship and admission portals</li>
        <li>• PDF compression for government job applications</li>
        <li>• Online registrations with strict PDF size limits</li>
        <li>• Signature and document uploads requiring very small files</li>
      </ul>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Tips for Achieving 100KB PDF Size
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        A 100KB limit is extremely restrictive. For best results, use single-page,
        text-based documents, remove unnecessary images or margins, and avoid scanned
        photos where possible. Clean PDFs compress far more efficiently.
      </p>
    </section>
  </div>
);

const CompressPDF100KB = () => {
  useSEO({
    title: "Compress PDF to 100KB Online | Free PDF Compressor",
    description:
      "Compress PDF to 100KB online for exam forms, scholarships, and government portals. Free, secure, and works directly in your browser.",
    canonical: "/compress-pdf-100kb",
  });

  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const targetSize = 100 * 1024;

  const compressToTargetSize = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      let minQuality = 5;
      let maxQuality = 95;
      let bestBlob: Blob | null = null;
      let bestQuality = minQuality;

      const minBlob = await createCompressedPDF(pdf, numPages, minQuality);

      if (minBlob.size > targetSize) {
        bestBlob = minBlob;
        toast({
          title: "Target size not achievable",
          description: `Minimum possible size is ${(minBlob.size / 1024).toFixed(
            0
          )}KB. Try using a single-page document.`,
        });
      } else {
        while (maxQuality - minQuality > 5) {
          const midQuality = Math.floor((minQuality + maxQuality) / 2);
          const blob = await createCompressedPDF(pdf, numPages, midQuality);

          if (blob.size <= targetSize) {
            bestBlob = blob;
            bestQuality = midQuality;
            minQuality = midQuality;
          } else {
            maxQuality = midQuality;
          }
        }

        if (!bestBlob) {
          bestBlob = await createCompressedPDF(pdf, numPages, minQuality);
        }

        toast({
          title: "Compression Complete",
          description: `Compressed to ${(bestBlob.size / 1024).toFixed(
            0
          )}KB using ${bestQuality}% quality`,
        });
      }

      if (bestBlob) {
        saveAs(bestBlob, `compressed_100kb_${file.name}`);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Compression Failed",
        description: "There was an error compressing your PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const createCompressedPDF = async (
    pdf: pdfjsLib.PDFDocumentProxy,
    numPages: number,
    quality: number
  ): Promise<Blob> => {
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1 });
    const isLandscape = viewport.width > viewport.height;

    const doc = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "pt",
      format: [viewport.width, viewport.height],
    });

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const pageViewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.height = pageViewport.height;
      canvas.width = pageViewport.width;

      await page.render({
        canvasContext: context,
        viewport: pageViewport,
        canvas: canvas,
      } as any).promise;

      const imgData = canvas.toDataURL("image/jpeg", quality / 100);

      if (i > 1) {
        doc.addPage([pageViewport.width, pageViewport.height]);
      }

      doc.addImage(imgData, "JPEG", 0, 0, pageViewport.width, pageViewport.height);
    }

    return doc.output("blob");
  };

  return (
    <ToolLayout
      title="Compress PDF to 100KB"
      description="Maximum PDF compression for strict 100KB file size limits on exam forms and application portals."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={compressToTargetSize} accept=".pdf" maxSize={50} />

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Applying maximum compression…
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Note:</strong> A 100KB limit is extremely
            restrictive. Best results are achieved with single-page, text-based PDFs.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CompressPDF100KB;
