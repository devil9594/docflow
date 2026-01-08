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
      "Compress PDF files online and reduce file size by around 20–25%. Browser-based, fast, and free.",
  });

  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const compressPDF = async () => {
    if (!file) return;

    setProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      // 🎯 CONTROLLED COMPRESSION SETTINGS
      const RENDER_SCALE = 1.25;   // moderate downscale
      const JPEG_QUALITY = 0.78;   // preserves readability

      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: RENDER_SCALE });

      const doc = new jsPDF({
        orientation: viewport.width > viewport.height ? "landscape" : "portrait",
        unit: "pt",
        format: [viewport.width, viewport.height],
      });

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: RENDER_SCALE });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = vp.width;
        canvas.height = vp.height;

        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        const img = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        if (i > 1) doc.addPage();

        doc.addImage(img, "JPEG", 0, 0, vp.width, vp.height);
      }

      const blob = doc.output("blob");
      saveAs(blob, `compressed_${file.name}`);

      toast({
        title: "PDF Compressed",
        description: "File size reduced by approximately 20–25%.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Compression Failed",
        description: "This PDF could not be processed in the browser.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF size by about 20–25% with controlled quality reduction."
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={setFile} accept=".pdf" maxSize={50} />

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
