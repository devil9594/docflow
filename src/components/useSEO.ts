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

    /**
     * CANONICAL HARD LOCK
     * -------------------
     * We explicitly REMOVE any canonical tags
     * that were injected by JavaScript.
     * Canonical must ONLY come from index.html
     * for HashRouter + GitHub Pages.
     */

    const canonicals = document.querySelectorAll('link[rel="canonical"]');

    canonicals.forEach((link, index) => {
      // Keep ONLY the first canonical (from index.html)
      if (index > 0) {
        link.remove();
      }
    });
  }, [title, description]);
};
