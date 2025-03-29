
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";
import { createTemplate } from "@/data/workOrderTemplatesData";
import { WorkOrderTemplate } from "@/types/workOrder";

interface SaveAsTemplateDialogProps {
  formValues: WorkOrderFormValues;
  onSave: (template: WorkOrderTemplate) => void;
}

export function SaveAsTemplateDialog({ formValues, onSave }: SaveAsTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Create a new template object
      const newTemplate = createTemplate({
        name,
        description,
        status: formValues.status,
        priority: formValues.priority,
        technician: formValues.technician,
        notes: formValues.notes,
        inventoryItems: formValues.inventoryItems,
        customer: formValues.customer,
        location: formValues.location,
      });

      // Pass the new template to the parent component
      onSave(newTemplate);

      // Show success toast
      toast({
        title: "Template Saved",
        description: `${name} has been saved as a template.`,
        variant: "success",
      });

      // Close the dialog
      setOpen(false);
      
      // Reset form
      setName("");
      setDescription("");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Save as Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a reusable template from the current work order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard HVAC Maintenance"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this template..."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
