
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ isSubmitting, onCancel }) => {
  return (
    <div className="flex space-x-4 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4"
      >
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="px-4 bg-esm-blue-600 hover:bg-esm-blue-700 text-white"
      >
        <Save className="mr-2 h-4 w-4" />
        {isSubmitting ? "Creating..." : "Create Work Order"}
      </Button>
    </div>
  );
};
