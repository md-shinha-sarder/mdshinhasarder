import { useLocation, Link } from "@/lib/router";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 bg-card border border-border rounded-2xl max-w-md shadow-card">
        <h1 className="mb-4 text-5xl font-bold font-serif text-gradient-gold">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link href="/" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-gold text-primary-foreground font-medium text-sm hover:opacity-90 transition">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
