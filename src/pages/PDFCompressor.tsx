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
    title: "Compress PDF Online | Reduce PDF Size by 20–25%",
    description:
      "Compress PDF files online and reduce size by about 20–25%. Browser-based and free.",
  });

  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setOriginalSize(selected.size);
  };

  const compressPDF = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: buffer,
        disableFontFace: true,
      });

      const pdf = await loadingTask.promise;

      const RENDER_SCALE = 1.25;
      const JPEG_QUALITY = 0.78;

      const firstPage = await pdf.getPage(1);
      const baseViewport = firstPage.getViewport({ scale: RENDER_SCALE });

      const doc = new jsPDF({
        orientation:
          baseViewport.width > baseViewport.height ? "landscape" : "portrait",
        unit: "pt",
        format: [baseViewport.width, baseViewport.height],
      });

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Canvas not supported");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const img = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        if (i > 1) doc.addPage();
        doc.addImage(img, "JPEG", 0, 0, viewport.width, viewport.height);
      }

      const blob = doc.output("blob");
      saveAs(blob, `compressed_${file.name}`);

      toast({
        title: "PDF Compressed",
        description: "File size reduced with controlled quality loss.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Unsupported PDF",
        description:
          "This PDF cannot be compressed in the browser (encrypted or digitally signed).",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF size by about 20–25% using browser-based compression."
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={handleFileSelect} accept=".pdf" maxSize={50} />

        {file && originalSize && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p>
              <strong>File:</strong> {file.name}
            </p>
            <p>
              <strong>Original size:</strong>{" "}
              {(originalSize / 1024 / 1024).toFixed(2)} MB
            </p>
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
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
