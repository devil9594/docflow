import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
}

export const useSEO = ({ title, description }: SEOConfig) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Set meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    // IMPORTANT:
    // Canonical is intentionally NOT handled here.
    // It is defined once in index.html to avoid
    // broken or duplicate canonicals with HashRouter.
  }, [title, description]);
};
