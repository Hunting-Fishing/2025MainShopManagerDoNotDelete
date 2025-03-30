
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CustomerFormActionsProps {
  isSubmitting: boolean;
}

export const CustomerFormActions: React.FC<CustomerFormActionsProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-4 pt-4">
      <Button 
        variant="outline" 
        type="button"
        onClick={() => navigate("/customers")}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Customer"}
      </Button>
    </div>
  );
};
