
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { saveInvoiceTemplate } from "@/services/invoiceService";
import { adaptInvoiceItemsToTemplateItems } from "./helpers";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceItems: InvoiceItem[];
  defaultNotes?: string;
  defaultDueDateDays?: number;
  defaultTaxRate?: number;
  onSaveSuccess?: (template: InvoiceTemplate) => void;
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  invoiceItems,
  defaultNotes = "",
  defaultDueDateDays = 30,
  defaultTaxRate = 0.08,
  onSaveSuccess
}: SaveTemplateDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Template name required",
        description: "Please provide a name for your template",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Convert the invoice items to template items
      const templateItems = adaptInvoiceItemsToTemplateItems(invoiceItems, "pending-id");

      const template = await saveInvoiceTemplate({
        name,
        description,
        defaultNotes: defaultNotes || "",
        defaultDueDateDays,
        defaultTaxRate,
        lastUsed: null,
        defaultItems: templateItems
      });

      toast({
        title: "Template saved",
        description: `Invoice template "${name}" has been saved successfully`,
      });

      if (onSaveSuccess) {
        onSaveSuccess(template);
      }

      onOpenChange(false);
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Failed to save template",
        description: "There was an error saving your invoice template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save current invoice as a reusable template
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Oil Change Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-description">Description (optional)</Label>
            <Textarea
              id="template-description"
              placeholder="Describe what this template is used for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            This template will include {invoiceItems.length} item(s), notes, and tax settings.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
