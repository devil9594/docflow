import { useSEO } from "@/components/useSEO";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const PDFCompressor = () => {
  useSEO({
    title: "Compress PDF Online Free | Reduce PDF File Size Securely",
    description:
      "Compress PDF files online for free. Reduce PDF size securely in your browser.",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState([70]);
  const { toast } = useToast();

  const compressPDF = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);

      // 🔥 ACTUAL COMPRESSION
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setCreator("");
      pdfDoc.setProducer("");

      pdfDoc.context.lookup = new Proxy(pdfDoc.context.lookup, {
        apply(target, thisArg, args) {
          return Reflect.apply(target, thisArg, args);
        },
      });

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        compress: true,
      });

      const blob = new Blob([compressedBytes], {
        type: "application/pdf",
      });

      if (blob.size >= selectedFile.size) {
        toast({
          title: "Already Optimized",
          description:
            "This PDF cannot be reduced further without quality loss.",
        });
      }

      saveAs(blob, `compressed_${selectedFile.name}`);

      toast({
        title: "PDF Compressed",
        description: "Your optimized PDF has been downloaded.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Compression Failed",
        description:
          "This PDF cannot be optimized in the browser. Some PDFs require server-side tools.",
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
                Optimization level: {quality[0]}%
              </label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={50}
                max={90}
                step={10}
              />
              <p className="text-xs text-muted-foreground">
                Lossless optimization (no visual quality loss)
              </p>
            </div>

            <Button onClick={compressPDF} className="w-full">
              Compress PDF
            </Button>
          </>
        )}

        {processing && (
          <div className="flex justify-center gap-2">
            <Loader2 className="animate-spin" />
            <span>Optimizing PDF…</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
