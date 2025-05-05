
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkOrderFormHeaderProps {
  isEditing?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
}

export const WorkOrderFormHeader: React.FC<WorkOrderFormHeaderProps> = ({
  isEditing = false,
  isSubmitting = false,
  error = null,
  title,
  description,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-4 rounded-t-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {title || (isEditing ? "Edit Work Order" : "Create Work Order")}
        </h1>
        <p className="text-muted-foreground">
          {description || (isEditing ? "Update the work order details" : "Enter the work order details")}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
              {isEditing ? "Updating..." : "Saving..."}
            </span>
          ) : (
            <>{isEditing ? "Update Work Order" : "Create Work Order"}</>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4 w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
