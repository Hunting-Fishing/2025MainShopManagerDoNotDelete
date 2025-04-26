
import React, { useState } from 'react';
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
import { InvoiceItem, Invoice, InvoiceTemplate } from '@/types/invoice';

interface SaveTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  currentInvoice: Invoice;
  taxRate: number;
  onSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
}

export function SaveTemplateDialog({
  open,
  onClose,
  currentInvoice,
  taxRate,
  onSaveTemplate,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;
    
    setSaving(true);
    try {
      // Create the template data
      const templateData = {
        name,
        description,
        default_notes: currentInvoice.notes || "",
        default_due_date_days: 30, // Default value
        default_tax_rate: taxRate,
        usage_count: 0,
        last_used: null,
        defaultItems: currentInvoice.items || []
      };
      
      onSaveTemplate(templateData);
      onClose();
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            This will save the current invoice as a reusable template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              placeholder="e.g., Standard Service Invoice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description (optional)</Label>
            <Textarea
              id="templateDescription"
              placeholder="Describe what this template is used for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name || saving}>
              {saving ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
