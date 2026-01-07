# DocFlow - Document Processing Platform

A professional, browser-based document processing suite for PDF compression, conversion, and manipulation. All processing happens locally in your browser—no files are uploaded to external servers.

## Features

### PDF Tools
- **PDF Compressor** — Reduce PDF file size with adjustable quality settings
- **Compress to 200KB** — Target-size compression for government form uploads
- **Compress to 100KB** — Maximum compression for strict file size limits
- **Merge PDF** — Combine multiple PDF files into one document
- **Split PDF** — Extract specific pages or ranges from PDFs

### Conversion Tools
- **JPG to PDF** — Convert images to PDF documents
- **PDF to JPG** — Extract PDF pages as high-quality images
- **Word to PDF** — Convert DOCX documents to PDF format
- **PDF to Word** — Extract text from PDFs to editable Word files

### Image Tools
- **Image Compressor** — Optimize JPG and PNG images with quality control

## Tech Stack

- **React 18** — Modern component-based UI
- **TypeScript** — Type-safe development
- **Vite** — Fast build tooling
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Accessible component library
- **pdf-lib** — PDF manipulation
- **pdfjs-dist** — PDF rendering and parsing
- **jsPDF** — PDF generation
- **mammoth** — Word document parsing
- **docx** — Word document generation

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd docflow

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

### GitHub Pages

1. Update `vite.config.ts` with your repository name:
```ts
export default defineConfig({
  base: '/<repository-name>/',
  // ...
})
```

2. Build the project:
```bash
npm run build
```

3. Deploy the `dist` folder to GitHub Pages using your preferred method (gh-pages, GitHub Actions, etc.)

### Static Hosting

The `dist` folder can be deployed to any static hosting provider:
- Netlify
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Any web server (nginx, Apache)

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ToolCard.tsx
│   ├── ToolLayout.tsx
│   └── FileUpload.tsx
├── pages/           # Route pages
│   ├── Index.tsx
│   ├── PDFCompressor.tsx
│   ├── CompressPDF200KB.tsx
│   ├── CompressPDF100KB.tsx
│   ├── JPGtoPDF.tsx
│   ├── PDFtoJPG.tsx
│   ├── ImageCompressor.tsx
│   ├── MergePDF.tsx
│   ├── SplitPDF.tsx
│   ├── WordToPDF.tsx
│   └── PDFtoWord.tsx
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── index.css        # Global styles and design tokens
```

## Security

All document processing happens entirely in the browser. Files are never uploaded to external servers, ensuring complete privacy and data security.

## License

MIT License - See LICENSE file for details.

---

© 2026 DocFlow. All rights reserved.
