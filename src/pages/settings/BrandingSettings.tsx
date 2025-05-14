
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const BrandingSettings = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the Account settings with branding tab selected
    navigate("/settings/account?tab=branding");
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2">Redirecting to account settings...</span>
    </div>
  );
};

export default BrandingSettings;
