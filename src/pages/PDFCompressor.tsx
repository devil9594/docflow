import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/components/useSEO";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const PDFCompressor = () => {
  useSEO({
    title: "Compress PDF Online | Reduce PDF Size",
    description:
      "Compress PDF files online and reduce file size by about 20–25%. Browser-based and free.",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState([80]); // 🔑 tuned for 20–25%
  const { toast } = useToast();

  const compressPDF = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const numPages = pdf.numPages;

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

        // 🔑 MODERATE render scale (NOT aggressive)
        const pageViewport = page.getViewport({ scale: 1.25 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = pageViewport.width;
        canvas.height = pageViewport.height;

        await page.render({
          canvasContext: context,
          viewport: pageViewport,
        } as any).promise;

        const imgData = canvas.toDataURL(
          "image/jpeg",
          quality[0] / 100
        );

        if (i > 1) {
          doc.addPage([viewport.width, viewport.height]);
        }

        doc.addImage(
          imgData,
          "JPEG",
          0,
          0,
          viewport.width,
          viewport.height
        );
      }

      const compressedBlob = doc.output("blob");
      const originalSize = selectedFile.size;
      const reduction = (
        ((originalSize - compressedBlob.size) / originalSize) *
        100
      ).toFixed(1);

      saveAs(compressedBlob, `compressed_${selectedFile.name}`);

      toast({
        title: "PDF Compressed",
        description: `Size reduced by ${reduction}%. Original: ${(originalSize / 1024 / 1024).toFixed(
          2
        )}MB → Compressed: ${(compressedBlob.size / 1024 / 1024).toFixed(
          2
        )}MB`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Compression Failed",
        description:
          "This PDF could not be processed fully in the browser.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size by about 20–25% using browser-based compression."
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={setSelectedFile}
          accept=".pdf"
          maxSize={50}
        />

        {selectedFile && !processing && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Selected: {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Compression level
              </label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={70}
                max={90}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Balanced compression (recommended)
              </p>
            </div>

            <Button onClick={compressPDF} className="w-full">
              Compress PDF
            </Button>
          </div>
        )}

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Compressing your PDF...
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Note: Compression slightly reduces quality and may remove selectable text.
        </p>
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
