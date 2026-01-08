import { useSEO } from "@/components/useSEO";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PDFCompressor = () => {
  useSEO({
    title: "Compress PDF Online | Reduce PDF Size",
    description:
      "Compress PDF files online and reduce file size using browser-based optimization. Some PDFs may already be optimized.",
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
      const bytes = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(bytes, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      // Remove metadata (safe, lossless)
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("");
      pdfDoc.setCreator("");

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedBytes], {
        type: "application/pdf",
      });

      setCompressedSize(blob.size);

      if (blob.size < file.size) {
        saveAs(blob, `compressed_${file.name}`);
        toast({
          title: "PDF Optimized",
          description: "Your PDF was optimized and downloaded.",
        });
      } else {
        toast({
          title: "Already Optimized",
          description:
            "This PDF is already optimized and cannot be reduced further in the browser.",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Unsupported PDF",
        description:
          "This PDF cannot be optimized in the browser (encrypted, signed, or complex format).",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size using browser-based optimization. Some PDFs may already be optimized."
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={handleFileSelect} accept=".pdf" maxSize={50} />

        {file && originalSize && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
            <p>
              <strong>File:</strong> {file.name}
            </p>
            <p>
              <strong>Original size:</strong> {formatSize(originalSize)}
            </p>
            {compressedSize && (
              <p className="text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>
                  <strong>Compressed size:</strong>{" "}
                  {formatSize(compressedSize)}
                </span>
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
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="animate-spin" />
            <span>Optimizing PDF…</span>
          </div>
        )}

        {/* SEO & Trust Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Note: This tool optimizes PDFs in your browser. Some PDFs may already be
          optimized or not supported.
        </p>
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
