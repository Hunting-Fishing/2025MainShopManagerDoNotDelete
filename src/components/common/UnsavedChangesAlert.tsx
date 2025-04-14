
import React, { useEffect } from "react";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface UnsavedChangesAlertProps {
  isDirty: boolean;
  message?: string;
  showVisualAlert?: boolean;
}

export const UnsavedChangesAlert: React.FC<UnsavedChangesAlertProps> = ({ 
  isDirty,
  message = "You have unsaved changes. Are you sure you want to leave?",
  showVisualAlert = false
}) => {
  // Block navigation when the form has unsaved changes
  useBeforeUnload(isDirty, message);
  
  // For accessibility: announce changes to screen readers when form becomes dirty
  useEffect(() => {
    if (isDirty) {
      const alertElement = document.createElement('div');
      alertElement.setAttribute('role', 'status');
      alertElement.setAttribute('aria-live', 'polite');
      alertElement.className = 'sr-only';
      alertElement.textContent = 'You have unsaved changes';
      
      document.body.appendChild(alertElement);
      
      return () => {
        document.body.removeChild(alertElement);
      };
    }
  }, [isDirty]);

  if (showVisualAlert && isDirty) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200 mb-4">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Unsaved Changes</AlertTitle>
        <AlertDescription className="text-yellow-700">
          You have unsaved changes that will be lost if you navigate away.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null; // This is a utility component, no UI to render by default
}
