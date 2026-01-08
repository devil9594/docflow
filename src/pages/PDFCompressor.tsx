import { useSEO } from "@/components/useSEO";
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

// ✅ CRITICAL: disable worker (fixes GitHub Pages crashes)
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

const PDFCompressor = () => {
  useSEO({
    title: "Compress PDF Online Free | Reduce PDF File Size Securely",
    description:
      "Compress PDF files online for free. Reduce PDF size without losing quality. Fast, secure, browser-based PDF compressor.",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState([70]);
  const { toast } = useToast();

  const compressPDF = async () => {
    if (!selectedFile) return;

    // 🔒 HARD SAFETY LIMIT
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please use PDFs under 20MB for browser compression.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: buffer,
        disableWorker: true,
      }).promise;

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      const doc = new jsPDF({
        orientation: viewport.width > viewport.height ? "landscape" : "portrait",
        unit: "pt",
        format: [viewport.width, viewport.height],
      });

      for (let i = 1; i <= pdf.numPages; i++) {
        const p = await pdf.getPage(i);
        const v = p.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Canvas not supported");

        canvas.width = v.width;
        canvas.height = v.height;

        await p.render({ canvasContext: ctx, viewport: v }).promise;

        const img = canvas.toDataURL("image/jpeg", quality[0] / 100);

        if (i > 1) doc.addPage();

        doc.addImage(img, "JPEG", 0, 0, v.width, v.height);
      }

      const output = doc.output("blob");

      saveAs(output, `compressed_${selectedFile.name}`);

      toast({
        title: "PDF Compressed",
        description: "Your compressed PDF has been downloaded.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Compression Failed",
        description:
          "This PDF cannot be compressed in the browser. Please try a smaller or simpler file.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size securely in your browser."
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={setSelectedFile} accept=".pdf" maxSize={50} />

        {selectedFile && !processing && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quality: {quality[0]}%
              </label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={30}
                max={90}
                step={10}
              />
            </div>

            <Button onClick={compressPDF} className="w-full">
              Compress PDF
            </Button>
          </>
        )}

        {processing && (
          <div className="flex justify-center gap-2">
            <Loader2 className="animate-spin" />
            <span>Compressing…</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
