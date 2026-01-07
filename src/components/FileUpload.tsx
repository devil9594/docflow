import { useCallback } from "react";
import { Upload, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept: string;
  multiple?: boolean;
  maxSize?: number;
}

const FileUpload = ({ onFileSelect, accept, multiple = false, maxSize = 50 }: FileUploadProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (!multiple && files.length > 1) {
      toast({
        title: "Multiple files not supported",
        description: "Please upload one file at a time.",
        variant: "destructive",
      });
      return;
    }

    const file = files[0];
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB.`,
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, multiple, maxSize, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (files[0].size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSize}MB.`,
          variant: "destructive",
        });
        return;
      }
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground mb-1">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum file size: {maxSize}MB
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Files are processed locally in your browser</span>
          </div>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
