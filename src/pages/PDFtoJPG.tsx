import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/components/useSEO";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Convert PDF Pages to JPG Images Online
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Convert PDF files to high-quality JPG images for presentations, websites,
        and sharing. Each page is extracted as a separate image that you can
        download and use anywhere. Everything works locally in your browser for
        complete privacy.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common PDF to JPG Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Convert PDF pages for PowerPoint presentations</li>
        <li>• Extract charts and graphics from PDF documents</li>
        <li>• Create image previews of PDFs</li>
        <li>• Convert PDF pages for social media sharing</li>
        <li>• Turn PDFs into images for web embedding</li>
      </ul>
    </section>
  </div>
);

const PDFtoJPG = () => {
  useSEO({
    title: "PDF to JPG Converter Online | Convert PDF to Images Free",
    description:
      "Convert PDF files to JPG images online for free. Extract high-quality images from PDF pages securely in your browser.",
    canonical: "/pdf-to-jpg",
  });

  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToJPG = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context!,
          viewport,
        } as any).promise;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = file.name.replace(
                ".pdf",
                `_page_${pageNum}.jpg`
              );
              saveAs(blob, fileName);
            }
          },
          "image/jpeg",
          0.95
        );
      }

      toast({
        title: "Conversion Complete",
        description: `Converted ${pdf.numPages} page(s) to JPG.`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to JPG Converter"
      description="Convert PDF pages to high-quality JPG images for presentations and sharing."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={convertToJPG} accept=".pdf" maxSize={50} />

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Converting PDF to JPG…</p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Note:</strong> Each page is saved
            as a separate JPG image.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PDFtoJPG;
