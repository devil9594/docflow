import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Compress PDF Below 200KB for Government Applications
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Many government portals require PDF files under 200KB for document uploads. 
        This tool automatically finds the optimal compression level to meet that requirement 
        while preserving maximum readability. Perfect for Aadhaar card uploads, passport 
        applications, PAN card submissions, and other official document submissions.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Ideal For These Applications
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Compress PDF for Aadhaar card upload without losing quality</li>
        <li>• Reduce PDF size for government form submission</li>
        <li>• PDF compressor for passport, PAN card, and exam forms</li>
        <li>• Compress PDF below 200KB for online applications</li>
        <li>• Fast PDF compression for college admission forms</li>
      </ul>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        How It Works
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        The tool uses a smart compression algorithm that tests multiple quality levels 
        to find the highest quality that still fits under 200KB. For most single-page 
        documents like ID cards and certificates, the result is nearly indistinguishable 
        from the original. Multi-page documents may require lower quality to meet the target.
      </p>
    </section>
  </div>
);

const CompressPDF200KB = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const targetSize = 200 * 1024;

  const compressToTargetSize = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      let minQuality = 5;
      let maxQuality = 95;
      let bestBlob: Blob | null = null;
      let bestQuality = minQuality;
      
      const minBlob = await createCompressedPDF(pdf, numPages, minQuality);
      
      if (minBlob.size > targetSize) {
        bestBlob = minBlob;
        toast({
          title: "Target size not achievable",
          description: `Minimum possible size is ${(minBlob.size / 1024).toFixed(0)}KB. Try using fewer pages.`,
        });
      } else {
        while (maxQuality - minQuality > 5) {
          const midQuality = Math.floor((minQuality + maxQuality) / 2);
          const blob = await createCompressedPDF(pdf, numPages, midQuality);
          
          if (blob.size <= targetSize) {
            bestBlob = blob;
            bestQuality = midQuality;
            minQuality = midQuality;
          } else {
            maxQuality = midQuality;
          }
        }
        
        if (!bestBlob) {
          bestBlob = await createCompressedPDF(pdf, numPages, minQuality);
        }
        
        toast({
          title: "Compression Complete",
          description: `Compressed to ${(bestBlob.size / 1024).toFixed(0)}KB with ${bestQuality}% quality`,
        });
      }
      
      if (bestBlob) {
        saveAs(bestBlob, `compressed_200kb_${file.name}`);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Compression Failed",
        description: "There was an error compressing your PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const createCompressedPDF = async (pdf: pdfjsLib.PDFDocumentProxy, numPages: number, quality: number): Promise<Blob> => {
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1 });
    const isLandscape = viewport.width > viewport.height;
    
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [viewport.width, viewport.height]
    });
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const pageViewport = page.getViewport({ scale: 1 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = pageViewport.height;
      canvas.width = pageViewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: pageViewport,
        canvas: canvas,
      } as any).promise;
      
      const imgData = canvas.toDataURL('image/jpeg', quality / 100);
      
      if (i > 1) {
        doc.addPage([pageViewport.width, pageViewport.height]);
      }
      
      doc.addImage(imgData, 'JPEG', 0, 0, pageViewport.width, pageViewport.height);
    }
    
    return doc.output('blob');
  };

  return (
    <ToolLayout
      title="Compress PDF to 200KB"
      description="Automatically compress your PDF to approximately 200KB for government portals and form submissions."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={compressToTargetSize}
          accept=".pdf"
          maxSize={50}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Finding optimal compression level...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Note:</strong> The tool finds the best quality 
            setting to achieve ~200KB. Very large PDFs may not reach this target.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CompressPDF200KB;
