import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

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

/**
 * ✅ Handles GitHub Pages SPA redirect from 404.html
 */
function RedirectHandler({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem("redirectPath");
    if (!redirectPath) return;

    sessionStorage.removeItem("redirectPath");

    const BASE = "/docflow";

    let cleanPath = redirectPath.startsWith(BASE)
      ? redirectPath.slice(BASE.length)
      : redirectPath;

    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    // Only redirect once, only from home
    if (location.pathname === "/" && cleanPath !== "/") {
      navigate(cleanPath, { replace: true });
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter basename="/docflow">
        <RedirectHandler>
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
        </RedirectHandler>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
