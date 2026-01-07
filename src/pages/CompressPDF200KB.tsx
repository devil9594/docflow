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
        Compress PDF to 200KB for Government and Online Forms
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Many government portals and online applications require PDF files under
        200KB. This tool automatically finds the optimal compression level to
        meet that requirement while preserving maximum readability. Ideal for
        Aadhaar uploads, passport applications, PAN card submissions, and other
        official documents.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases for 200KB PDF Compression
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Compress PDF to 200KB for Aadhaar card uploads</li>
        <li>• Reduce PDF size for government form submissions</li>
        <li>• PDF compression for passport and PAN card applications</li>
        <li>• Compress PDF below 200KB for online portals</li>
        <li>• College admission and exam form uploads</li>
      </ul>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        How the 200KB PDF Compressor Works
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        The compressor uses a smart algorithm that tests multiple image quality
        levels to find the highest possible quality that still fits under 200KB.
        Single-page documents usually retain excellent clarity, while multi-page
        PDFs may require stronger compression to meet the limit.
      </p>
    </section>
  </div>
);

const CompressPDF200KB = () => {
  useSEO({
    title: "Compress PDF to 200KB Online | Free PDF Compressor",
    description:
      "Compress PDF to 200KB online for Aadhaar, passport, and government portals. Free, fast, and fully browser-based with no uploads.",
    canonical: "/compress-pdf-200kb",
  });

  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const targetSize = 200 * 1024;

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
          )}KB. Try using fewer pages.`,
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
        saveAs(bestBlob, `compressed_200kb_${file.name}`);
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
      title="Compress PDF to 200KB"
      description="Automatically compress your PDF to 200KB for government portals and online form submissions."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={compressToTargetSize} accept=".pdf" maxSize={50} />

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Finding optimal compression level…
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Note:</strong> This tool finds the
            best quality to achieve approximately 200KB. Very large or multi-page
            PDFs may not reach this target.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CompressPDF200KB;
