import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun } from "docx";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/components/useSEO";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Convert PDF to Editable Word Document Online
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Convert PDF files to editable Microsoft Word documents by extracting text
        content directly in your browser. This tool allows you to modify,
        reformat, and reuse content from PDF files without uploading them to any
        server.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common PDF to Word Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Extract text from PDF for editing</li>
        <li>• Convert PDF contracts into editable Word files</li>
        <li>• Create Word versions of reports and documents</li>
        <li>• Edit PDF content without retyping</li>
        <li>• Convert text-based PDFs to DOCX format</li>
      </ul>
    </section>
  </div>
);

const PDFtoWord = () => {
  useSEO({
    title: "PDF to Word Converter Online | Convert PDF to DOCX Free",
    description:
      "Convert PDF files to editable Word documents online. Free, fast, and secure PDF to Word converter that works directly in your browser.",
    canonical: "/pdf-to-word",
  });

  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToWord = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const paragraphs: Paragraph[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const lines: Map<number, string[]> = new Map();

        textContent.items.forEach((item: any) => {
          if ("str" in item && item.str.trim()) {
            const y = Math.round(item.transform[5]);
            if (!lines.has(y)) {
              lines.set(y, []);
            }
            lines.get(y)!.push(item.str);
          }
        });

        const sortedYPositions = Array.from(lines.keys()).sort(
          (a, b) => b - a
        );

        if (numPages > 1) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `--- Page ${i} ---`,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 400, after: 200 },
            })
          );
        }

        sortedYPositions.forEach((y) => {
          const lineText = lines.get(y)!.join(" ");
          if (lineText.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: lineText,
                    size: 24,
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          }
        });
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = file.name.replace(/\.pdf$/i, ".docx");
      saveAs(blob, fileName);

      toast({
        title: "Conversion Complete",
        description: "Your PDF has been converted to an editable Word file.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: "The file may be corrupted or password-protected.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Word Converter"
      description="Convert PDF files to editable Word documents by extracting text content."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        <FileUpload onFileSelect={convertToWord} accept=".pdf" maxSize={20} />

        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Extracting text and creating Word document…
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Note:</strong> This tool extracts
            text from PDFs. Images and complex layouts may not be preserved.
            Works best with text-based documents.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PDFtoWord;
