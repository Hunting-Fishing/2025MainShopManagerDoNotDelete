
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";
import { WorkOrderTemplate, WorkOrderInventoryItem } from "@/types/workOrder";

interface SaveAsTemplateDialogProps {
  formValues: WorkOrderFormValues;
  onSave: (template: WorkOrderTemplate) => void;
}

export const SaveAsTemplateDialog: React.FC<SaveAsTemplateDialogProps> = ({ 
  formValues,
  onSave 
}) => {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const { createTemplate } = useWorkOrderTemplates();

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please provide a name for your template",
        variant: "destructive"
      });
      return;
    }

    // Make sure all inventory items have required fields
    const inventoryItems: WorkOrderInventoryItem[] = (formValues.inventoryItems || []).map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    // Ensure status and priority are valid enum values
    const status = formValues.status || "pending";
    const priority = formValues.priority || "medium";

    // Create the template with values from the form
    const result = await createTemplate({
      name: templateName,
      description: templateDescription || `Template for ${formValues.customer}`,
      status: status as "pending" | "in-progress" | "completed" | "cancelled",
      priority: priority as "low" | "medium" | "high",
      technician: formValues.technician,
      notes: formValues.notes,
      inventoryItems: inventoryItems
    });

    if (result.success) {
      toast({
        title: "Template Saved",
        description: `"${templateName}" template has been saved successfully.`,
        variant: "success"
      });
      
      // Close dialog and notify parent component
      setOpen(false);
      
      // Create a complete template object to pass to the parent
      const savedTemplate: WorkOrderTemplate = {
        id: result.id || '',
        name: templateName,
        description: templateDescription || `Template for ${formValues.customer}`,
        status: status as "pending" | "in-progress" | "completed" | "cancelled", 
        priority: priority as "low" | "medium" | "high",
        technician: formValues.technician,
        notes: formValues.notes || '',
        inventoryItems: inventoryItems,
        createdAt: new Date().toISOString(),
        usageCount: 0
      };
      
      onSave(savedTemplate);
      
      // Reset form
      setTemplateName("");
      setTemplateDescription("");
    } else {
      toast({
        title: "Error Saving Template",
        description: result.message || "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Save as Template
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter a name for this template"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description (Optional)</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is used for"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
