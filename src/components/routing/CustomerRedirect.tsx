
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
    
    navigate("/customers", { replace: true });
  }, [id, navigate, toast]);

  return (
    <div className="flex items-center justify-center h-40">
      <div className="text-lg text-slate-500">Redirecting...</div>
    </div>
  );
};
