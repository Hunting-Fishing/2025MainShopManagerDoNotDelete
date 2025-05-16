
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InvoiceTemplate } from "@/types/invoice";

export interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
}

export const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({
  isOpen,
  onClose,
  invoice,
  onSaveTemplate,
}) => {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const handleSave = () => {
    if (!templateName.trim()) return;

    const template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount"> = {
      name: templateName.trim(),
      description: templateDescription.trim() || undefined,
      default_tax_rate: invoice.tax ? invoice.tax / invoice.subtotal : 0,
      default_due_date_days: 30, // Default value
      default_notes: invoice.notes,
    };

    onSaveTemplate(template);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTemplateName("");
    setTemplateDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!templateName.trim()}>
            Save Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
