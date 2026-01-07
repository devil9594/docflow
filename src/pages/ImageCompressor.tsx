import { useState } from "react";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Optimize Images for Web and Email
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Reduce image file sizes for faster website loading and email attachments. 
        Our image compressor lets you balance quality and file size with an 
        adjustable quality slider.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Compress images for faster website loading</li>
        <li>• Reduce photo size for email attachments</li>
        <li>• Optimize images for social media uploads</li>
        <li>• Compress product photos for e-commerce</li>
        <li>• Reduce image size for document embeddings</li>
      </ul>
    </section>
  </div>
);

const ImageCompressor = () => {
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState([80]);
  const { toast } = useToast();

  const compressImage = async (file: File) => {
    setProcessing(true);
    try {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const originalSize = file.size;
                const compressedSize = blob.size;
                const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                
                saveAs(blob, `compressed_${file.name}`);
                
                toast({
                  title: "Image Compressed",
                  description: `Size reduced by ${reduction}%. ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB`,
                });
              }
              setProcessing(false);
            },
            file.type,
            quality[0] / 100
          );
        };
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Compression Failed",
        description: "There was an error compressing your image.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Image Compressor"
      description="Optimize JPG and PNG images for web use and email attachments."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Compression Quality: {quality[0]}%
          </label>
          <Slider
            value={quality}
            onValueChange={setQuality}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            80% quality is recommended for web use.
          </p>
        </div>
        
        <FileUpload
          onFileSelect={compressImage}
          accept="image/jpeg,image/jpg,image/png"
          maxSize={20}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Compressing image...</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageCompressor;
