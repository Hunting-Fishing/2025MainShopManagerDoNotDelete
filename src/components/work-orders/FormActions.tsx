
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting,
  onCancel,
}) => {
  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-esm-blue-600 hover:bg-esm-blue-700"
      >
        {isSubmitting ? "Creating..." : "Create Work Order"}
      </Button>
    </div>
  );
};
