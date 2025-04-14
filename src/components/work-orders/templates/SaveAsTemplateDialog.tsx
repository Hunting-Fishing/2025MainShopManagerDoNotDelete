
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

    // Create the template with values from the form
    const result = await createTemplate({
      name: templateName,
      description: templateDescription || `Template for ${formValues.customer}`,
      status: formValues.status,
      priority: formValues.priority,
      technician: formValues.technician,
      notes: formValues.notes,
      inventoryItems: inventoryItems
    });

    if (result.success) {
      toast({
        title: "Template Saved",
        description: `"${templateName}" has been saved as a template.`,
        variant: "success",
      });
      
      // Reset and close
      setTemplateName("");
      setTemplateDescription("");
      setOpen(false);
    } else {
      toast({
        title: "Error Saving Template",
        description: result.message || "An error occurred while saving the template.",
        variant: "destructive",
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Name
              </Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="col-span-3"
                placeholder="Enter template name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter template description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
