
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-esm-blue-600">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't find the page you were looking for. Please check the URL or navigate back to the dashboard.
        </p>
        <Button asChild className="mt-4 bg-esm-blue-600 hover:bg-esm-blue-700">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
