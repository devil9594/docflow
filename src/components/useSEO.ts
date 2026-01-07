import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
  path: string;
}

export const useSEO = ({ title, description, path }: SEOConfig) => {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      "href",
      `https://devil9594.github.io/docflow${path}`
    );
  }, [title, description, path]);
};
