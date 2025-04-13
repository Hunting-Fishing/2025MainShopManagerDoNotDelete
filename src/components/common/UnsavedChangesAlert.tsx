
import React from "react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";

interface UnsavedChangesAlertProps {
  isDirty: boolean;
}

export const UnsavedChangesAlert: React.FC<UnsavedChangesAlertProps> = ({ isDirty }) => {
  // Block navigation when the form has unsaved changes
  useBeforeUnload(isDirty, "You have unsaved changes. Are you sure you want to leave?");
  
  return null; // This is a utility component, no UI to render
};
