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
        Maximum PDF Compression for Strict Size Limits
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Some portals have very strict 100KB file size limits. This tool applies 
        maximum compression to help you meet those requirements. Ideal for 
        competitive exam forms, scholarship applications, and portals with 
        stringent upload restrictions.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        When You Need 100KB Compression
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Compress PDF for exam form submission with strict limits</li>
        <li>• Reduce PDF size for scholarship application portals</li>
        <li>• PDF compressor for government job applications</li>
        <li>• Compress PDF below 100KB for online registrations</li>
        <li>• Maximum compression for signature and photo uploads</li>
      </ul>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Best Practices for 100KB Compression
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        100KB is very restrictive. For best results: use single-page documents, 
        ensure your original PDF is clean (no extra margins or blank space), and 
        consider using grayscale for non-photo documents. Text-based PDFs compress 
        better than image-heavy documents.
      </p>
    </section>
  </div>
);

const CompressPDF100KB = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const targetSize = 100 * 1024;

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
          description: `Minimum possible size is ${(minBlob.size / 1024).toFixed(0)}KB. Try using a single-page document.`,
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
        saveAs(bestBlob, `compressed_100kb_${file.name}`);
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
      title="Compress PDF to 100KB"
      description="Maximum compression for strict file size limits on exam forms and application portals."
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
            <p className="text-muted-foreground">Applying maximum compression...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Note:</strong> 100KB is very restrictive. 
            Works best with single-page, text-based documents. Complex PDFs may not reach this target.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CompressPDF100KB;
