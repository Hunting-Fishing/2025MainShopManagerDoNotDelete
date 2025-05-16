import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";
import { WorkOrder } from "@/types/workOrder";

interface SaveAsTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveTemplate: (templateData: any) => Promise<void>;
  workOrderData: WorkOrder;
}

export function SaveAsTemplateDialog({
  open,
  onClose,
  onSaveTemplate,
  workOrderData,
}: SaveAsTemplateDialogProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateNameError, setTemplateNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setTemplateNameError("Template name is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create a proper template object without invalid properties
      const templateData = {
        id: uuidv4(),
        name: templateName.trim(),
        description: workOrderData.description,
        status: workOrderData.status,
        priority: workOrderData.priority,
        technician: workOrderData.technician,
        notes: workOrderData.notes,
        // Add location if it exists in WorkOrderTemplate interface
        location: workOrderData.location,
        // Use correct property names that match the WorkOrderTemplate interface
        // Don't include createdAt directly
      };
      
      // Call the save template function
      await onSaveTemplate(templateData);
      
      onClose();
      toast({
        title: "Template Saved",
        description: `"${templateName}" has been saved as a template.`,
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Give this work order a name to save it as a template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Template Name
            </Label>
            <Input
              id="name"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                setTemplateNameError("");
              }}
              className="col-span-3"
            />
          </div>
          {templateNameError && (
            <p className="text-red-500 text-sm italic">{templateNameError}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSaveTemplate} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
