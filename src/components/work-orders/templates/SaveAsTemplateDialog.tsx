
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkOrderTemplate, WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";

interface SaveAsTemplateDialogProps {
  formValues: any;
  onSave: (template: WorkOrderTemplate) => void;
}

export function SaveAsTemplateDialog({ formValues, onSave }: SaveAsTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!templateName.trim()) return;
    
    setSaving(true);
    
    // Extract values we want to save in the template
    const {
      description,
      status,
      priority,
      technician,
      location,
      notes,
      inventoryItems,
      customer
    } = formValues;

    // Create template object
    const template: WorkOrderTemplate = {
      id: uuidv4(),
      name: templateName,
      description: description || "",
      createdAt: new Date().toISOString(),
      usageCount: 0,
      customer: customer || undefined,
      location: location || undefined,
      // Use type assertions to ensure we conform to the expected types
      status: status as WorkOrderStatusType,
      priority: priority as WorkOrderPriorityType,
      technician: technician || "",
      notes: notes || undefined,
      inventoryItems: inventoryItems || []
    };
    
    // Save the template
    onSave(template);
    
    // Reset form
    setTemplateName("");
    setSaving(false);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Save as Template
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Work Order as Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="template-name" className="text-sm font-medium">
                Template Name
              </label>
              <Input
                id="template-name"
                placeholder="Enter template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            
            <p className="text-sm text-slate-500">
              This will save the current work order configuration as a template
              that can be reused for future work orders.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !templateName} onClick={handleSave}>
              {saving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
