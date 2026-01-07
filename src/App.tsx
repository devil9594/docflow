import { HashRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./pages/Index";
import PDFCompressor from "./pages/PDFCompressor";
import CompressPDF200KB from "./pages/CompressPDF200KB";
import CompressPDF100KB from "./pages/CompressPDF100KB";
import JPGtoPDF from "./pages/JPGtoPDF";
import PDFtoJPG from "./pages/PDFtoJPG";
import ImageCompressor from "./pages/ImageCompressor";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import WordToPDF from "./pages/WordToPDF";
import PDFtoWord from "./pages/PDFtoWord";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* ✅ SINGLE ROUTER — THIS IS CRITICAL */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pdf-compressor" element={<PDFCompressor />} />
          <Route path="/compress-pdf-200kb" element={<CompressPDF200KB />} />
          <Route path="/compress-pdf-100kb" element={<CompressPDF100KB />} />
          <Route path="/jpg-to-pdf" element={<JPGtoPDF />} />
          <Route path="/pdf-to-jpg" element={<PDFtoJPG />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/merge-pdf" element={<MergePDF />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/pdf-to-word" element={<PDFtoWord />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
