
import { useRouteError, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const error = useRouteError() as any;
  console.error(error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 p-6">
        <h1 className="text-6xl font-bold text-primary">Oops!</h1>
        <h2 className="text-2xl font-semibold">An error occurred</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {error?.statusText || error?.message || "Sorry, an unexpected error has occurred."}
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
