import { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useSEO } from "@/components/useSEO";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ SEO for 404 page
  useSEO({
    title: "404 – Page Not Found | DocFlow",
    description:
      "The page you are looking for does not exist. Use DocFlow's free online PDF and document tools instead.",
    canonical: "/404",
    noindex: true,
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Optional soft redirect after 6 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 6000);

    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center max-w-md px-6">
        <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          You’ll be redirected to the homepage shortly.
        </p>
        <Link
          to="/"
          className="inline-block text-primary font-medium underline hover:text-primary/90"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
