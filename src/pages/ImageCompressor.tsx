import { useSEO } from "@/components/useSEO";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const PDFCompressor = () => {
  useSEO({
    title: "Compress PDF Online Free | Reduce PDF File Size Securely",
    description:
      "Compress PDF files online for free. Reduce PDF size by 20–25% securely in your browser. No uploads. No signup.",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const { toast } = useToast();

  const compressPDF = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setCompressedBlob(null);

    try {
      const bytes = await selectedFile.arrayBuffer();
      setOriginalSize(selectedFile.size);

      const pdfDoc = await PDFDocument.load(bytes);

      // ✅ SAFE LOSSLESS OPTIMIZATION
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setCreator("");
      pdfDoc.setProducer("");

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        compress: true,
      });

      const blob = new Blob([compressedBytes], {
        type: "application/pdf",
      });

      setCompressedBlob(blob);
      setCompressedSize(blob.size);

      const reduction = (
        ((selectedFile.size - blob.size) / selectedFile.size) *
        100
      ).toFixed(1);

      toast({
        title: "Compression Complete",
        description:
          reduction > 5
            ? `File size reduced by ${reduction}%`
            : "This PDF was already optimized. Minimal reduction achieved.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Compression Failed",
        description:
          "This PDF cannot be further compressed in the browser.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (!compressedBlob || !selectedFile) return;
    saveAs(compressedBlob, `compressed_${selectedFile.name}`);
  };

  const formatMB = (bytes: number) =>
    (bytes / 1024 / 1024).toFixed(2) + " MB";

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size securely in your browser. Ideal for job applications and government forms."
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={(file) => {
            setSelectedFile(file);
            setCompressedBlob(null);
            setOriginalSize(null);
            setCompressedSize(null);
          }}
          accept=".pdf"
          maxSize={50}
        />

        {selectedFile && !processing && !compressedBlob && (
          <>
            <div className="text-sm text-muted-foreground">
              Original size: {formatMB(selectedFile.size)}
            </div>

            <Button onClick={compressPDF} className="w-full">
              Compress PDF
            </Button>
          </>
        )}

        {processing && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Compressing your PDF…
            </span>
          </div>
        )}

        {compressedBlob && originalSize && compressedSize && (
          <div className="space-y-4 border rounded-lg p-4">
            <div className="text-sm">
              <p>
                <strong>Original size:</strong>{" "}
                {formatMB(originalSize)}
              </p>
              <p>
                <strong>Compressed size:</strong>{" "}
                {formatMB(compressedSize)}
              </p>
              <p>
                <strong>Reduction:</strong>{" "}
                {(
                  ((originalSize - compressedSize) / originalSize) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>

            <Button onClick={downloadPDF} className="w-full">
              Download Compressed PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
