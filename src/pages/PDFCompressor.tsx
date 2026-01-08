import { useSEO } from "@/components/useSEO";
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const PDFCompressor = () => {
  useSEO({
    title: "Compress PDF Online | Reduce PDF Size Fast",
    description:
      "Compress PDF files online by reducing quality. Fast, browser-based PDF compression.",
  });

  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setOriginalSize(selected.size);
    setCompressedSize(null);
  };

  const compressPDF = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      // 🔥 AGGRESSIVE BUT STABLE SETTINGS
      const RENDER_SCALE = 1.1;
      const JPEG_QUALITY = 0.55;

      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: RENDER_SCALE });

      const doc = new jsPDF({
        orientation:
          viewport.width > viewport.height ? "landscape" : "portrait",
        unit: "pt",
        format: [viewport.width, viewport.height],
      });

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: RENDER_SCALE });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unsupported");

        canvas.width = vp.width;
        canvas.height = vp.height;

        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        const img = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        if (i > 1) doc.addPage();
        doc.addImage(img, "JPEG", 0, 0, vp.width, vp.height);
      }

      const blob = doc.output("blob");
      setCompressedSize(blob.size);
      saveAs(blob, `compressed_${file.name}`);

      toast({
        title: "PDF Compressed",
        description: "File size significantly reduced with quality loss.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Compression Failed",
        description:
          "This PDF cannot be processed in the browser.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(2)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF size by lowering quality. Fast, browser-based compression."
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={handleFileSelect} accept=".pdf" maxSize={50} />

        {file && originalSize && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
            <p><strong>File:</strong> {file.name}</p>
            <p><strong>Original size:</strong> {formatSize(originalSize)}</p>
            {compressedSize && (
              <p className="text-green-600">
                <strong>Compressed size:</strong>{" "}
                {formatSize(compressedSize)}
              </p>
            )}
          </div>
        )}

        {file && !processing && (
          <Button onClick={compressPDF} className="w-full">
            Compress PDF
          </Button>
        )}

        {processing && (
          <div className="flex justify-center items-center gap-2 py-6">
            <Loader2 className="animate-spin" />
            <span>Compressing PDF…</span>
          </div>
        )}

        {/* SEO & TRUST */}
        <p className="text-xs text-muted-foreground text-center">
          Note: Compression reduces quality and removes selectable text.
        </p>
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
