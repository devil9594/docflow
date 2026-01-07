import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Extract PDF Pages as High-Quality Images
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Convert PDF pages to JPG images for presentations, documents, and social media. 
        Each page is extracted as a separate high-resolution image that you can use 
        in presentations, share online, or include in other documents.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Extract PDF pages for PowerPoint presentations</li>
        <li>• Convert PDF charts and graphics to images</li>
        <li>• Create image previews of PDF documents</li>
        <li>• Extract pages for social media sharing</li>
        <li>• Convert PDF to images for web embedding</li>
      </ul>
    </section>
  </div>
);

const PDFtoJPG = () => {
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
        
        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
          canvas: canvas,
        };
        
        await page.render(renderContext).promise;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(".pdf", `_page_${pageNum}.jpg`);
            saveAs(blob, fileName);
          }
        }, "image/jpeg", 0.95);
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
      title="PDF to JPG"
      description="Extract PDF pages as high-quality JPG images for presentations and sharing."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={convertToJPG}
          accept=".pdf"
          maxSize={50}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Converting to JPG...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Note:</strong> Each page will be saved as a separate JPG file.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PDFtoJPG;
