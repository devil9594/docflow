import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/components/useSEO";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Convert JPG Images to PDF Online
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Convert JPG and PNG images to PDF format instantly for document
        submissions and official use. Ideal for scanned documents, certificate
        photos, ID cards, and mobile phone images. Everything works locally in
        your browser for complete privacy.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common JPG to PDF Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Convert scanned documents to PDF for official submissions</li>
        <li>• Create PDF files from certificate and diploma photos</li>
        <li>• Convert ID card images to PDF format</li>
        <li>• Turn mobile phone photos into PDFs</li>
        <li>• Convert receipts and invoices to PDF for record keeping</li>
      </ul>
    </section>
  </div>
);

const JPGtoPDF = () => {
  useSEO({
    title: "JPG to PDF Converter Online | Convert Images to PDF Free",
    description:
      "Convert JPG and PNG images to PDF online for free. Fast, secure, and works directly in your browser without uploads.",
    canonical: "/jpg-to-pdf",
  });

  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToPDF = async (file: File) => {
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const imageBytes = await file.arrayBuffer();

      let image;
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (file.type === "image/png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Unsupported image format");
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });

      const fileName = file.name.replace(/\.[^/.]+$/, ".pdf");
      saveAs(blob, fileName);

      toast({
        title: "Conversion Complete",
        description: "Your image has been successfully converted to PDF.",
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your image.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="JPG to PDF Converter"
      description="Convert JPG and PNG images to PDF format online for document submissions and official use."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={convertToPDF}
          accept="image/jpeg,image/jpg,image/png"
          maxSize={20}
        />

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Converting image to PDF…</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default JPGtoPDF;
