import { useState } from "react";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { useSEO } from "@/components/useSEO";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Compress Images Online Without Losing Quality
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Large image files can slow down websites and exceed upload limits on
        email and online forms. This image compressor helps you reduce JPG and
        PNG file sizes while maintaining visual quality. Everything runs locally
        in your browser for maximum privacy.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases for Image Compression
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Compress images for faster website loading</li>
        <li>• Reduce image size for email attachments</li>
        <li>• Optimize photos for social media uploads</li>
        <li>• Compress product images for e-commerce stores</li>
        <li>• Reduce image size for online forms and documents</li>
      </ul>
    </section>
  </div>
);

const ImageCompressor = () => {
  useSEO({
    title: "Image Compressor Online | Reduce JPG & PNG Size Free",
    description:
      "Compress images online to reduce JPG and PNG file size. Free, fast, and secure image compressor that works directly in your browser.",
    canonical: "/image-compressor",
  });

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
                const reduction = (
                  ((originalSize - compressedSize) / originalSize) *
                  100
                ).toFixed(1);

                saveAs(blob, `compressed_${file.name}`);

                toast({
                  title: "Image Compressed",
                  description: `Size reduced by ${reduction}%. ${(originalSize / 1024).toFixed(
                    0
                  )}KB → ${(compressedSize / 1024).toFixed(0)}KB`,
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
      description="Compress JPG and PNG images online to reduce file size without losing quality."
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
            70–80% quality is recommended for most web images.
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
            <p className="text-muted-foreground">Compressing image…</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageCompressor;
