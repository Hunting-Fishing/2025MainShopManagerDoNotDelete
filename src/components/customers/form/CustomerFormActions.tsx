
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerFormActionsProps {
  isSubmitting: boolean;
  isEditMode?: boolean;
  customerId?: string;
}

export const CustomerFormActions: React.FC<CustomerFormActionsProps> = ({ 
  isSubmitting, 
  isEditMode = false,
  customerId 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleCancel = () => {
    if (isEditMode && customerId) {
      navigate(`/customers/${customerId}`);
    } else {
      navigate("/customers");
    }
  };
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} space-y-3 sm:space-y-0 sm:space-x-4 pt-4 w-full`}>
      <Button 
        variant="outline" 
        type="button"
        onClick={handleCancel}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting 
          ? (isEditMode ? "Updating..." : "Creating...") 
          : (isEditMode ? "Update Customer" : "Create Customer")}
      </Button>
    </div>
  );
};
