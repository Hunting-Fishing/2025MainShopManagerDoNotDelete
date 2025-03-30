
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerFormActionsProps {
  isSubmitting: boolean;
}

export const CustomerFormActions: React.FC<CustomerFormActionsProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-end'} space-y-3 sm:space-y-0 sm:space-x-4 pt-4 w-full sm:w-auto`}>
      <Button 
        variant="outline" 
        type="button"
        onClick={() => navigate("/customers")}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Creating..." : "Create Customer"}
      </Button>
    </div>
  );
};
