
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceItem, Invoice, InvoiceTemplate } from '@/types/invoice';
import { SaveIcon } from "lucide-react";

export interface SaveTemplateDialogProps {
  open?: boolean;
  onClose?: () => void;
  currentInvoice: Invoice;
  taxRate: number;
  onSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usage_count" | "last_used">) => void;
}

export function SaveTemplateDialog({
  open,
  onClose,
  currentInvoice,
  taxRate,
  onSaveTemplate,
}: SaveTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Use either the provided open state or our internal state
  const dialogOpen = open !== undefined ? open : isOpen;
  
  // Use either the provided close handler or our internal handler
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
    // Reset form
    setName("");
    setDescription("");
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;
    
    setSaving(true);
    try {
      // Convert invoice items to template items
      const templateItems = currentInvoice.items.map(item => ({
        ...item,
        templateId: 'pending' // Will be set by backend
      }));
      
      // Create the template data
      const templateData = {
        name,
        description,
        default_notes: currentInvoice.notes || "",
        default_due_date_days: 30, // Default value
        default_tax_rate: taxRate,
        defaultItems: templateItems
      };
      
      onSaveTemplate(templateData);
      handleClose();
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Only render the trigger button if using internal state */}
      {open === undefined && (
        <Button 
          onClick={() => setIsOpen(true)} 
          variant="outline" 
          size="sm"
          className="flex gap-2"
        >
          <SaveIcon className="h-4 w-4" />
          Save as Template
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleClose}>
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
                onClick={handleClose}
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
    </>
  );
}
