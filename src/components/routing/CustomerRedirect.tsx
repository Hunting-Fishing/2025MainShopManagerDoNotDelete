
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const CustomerRedirect = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  useEffect(() => {
    console.error("Invalid customer ID in URL:", id);
    toast({
      title: "Customer Not Found",
      description: "This customer doesn't exist or has been deleted. Redirecting to customers list.",
      variant: "destructive",
    });
    
    // Use a timeout to allow the user to see the message before redirecting
    const redirectTimer = setTimeout(() => {
      navigate("/customers", { replace: true });
    }, 3000);
    
    return () => clearTimeout(redirectTimer);
  }, [id, navigate, toast]);

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <Alert variant="destructive" className="border-red-500 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-lg">Customer Not Found</AlertTitle>
        <AlertDescription className="mt-2">
          <p>The customer you're looking for could not be found. The ID might be invalid or the customer may have been deleted.</p>
          <p className="mt-2 text-sm text-slate-600">Redirecting to customers list in 3 seconds...</p>
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => navigate("/customers")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to Customers List Now
        </Button>
      </div>
    </div>
  );
};
