import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/components/useSEO";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.js",
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
  const [quality, setQuality] = useState([80]);
  const { toast } = useToast();

  const compressPDF = async () => {
    if (!selectedFile) return;
    setProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        disableFontFace: true,
        useSystemFonts: true,
      }).promise;

      const numPages = pdf.numPages;
      const firstPage = await pdf.getPage(1);
      const baseViewport = firstPage.getViewport({ scale: 1 });

      const doc = new jsPDF({
        orientation:
          baseViewport.width > baseViewport.height ? "landscape" : "portrait",
        unit: "pt",
        format: [baseViewport.width, baseViewport.height],
      });

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.25 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const img = canvas.toDataURL("image/jpeg", quality[0] / 100);

        if (i > 1) doc.addPage();
        doc.addImage(
          img,
          "JPEG",
          0,
          0,
          baseViewport.width,
          baseViewport.height
        );
      }

      const blob = doc.output("blob");
      const reduction = (
        ((selectedFile.size - blob.size) / selectedFile.size) *
        100
      ).toFixed(1);

      saveAs(blob, `compressed_${selectedFile.name}`);

      toast({
        title: "PDF Compressed",
        description: `Size reduced by ${reduction}%.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "PDF Not Supported",
        description:
          "This PDF uses features that cannot be processed in the browser.",
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
        <FileUpload onFileSelect={setSelectedFile} accept=".pdf" maxSize={50} />

        {selectedFile && !processing && (
          <>
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Compression level
              </label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={70}
                max={90}
                step={5}
              />
            </div>

            <Button onClick={compressPDF} className="w-full">
              Compress PDF
            </Button>
          </>
        )}

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            Compressing PDF…
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Note: Compression reduces quality and may remove selectable text.
        </p>
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
