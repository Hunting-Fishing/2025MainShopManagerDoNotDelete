
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Invoice, InvoiceTemplate } from "@/types/invoice";

interface SaveTemplateDialogProps {
  invoice?: Invoice;
  currentInvoice?: Invoice;
  taxRate: number;
  onSaveTemplate: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  onClose?: () => void;
  open?: boolean; // Added to support external control
  isOpen?: boolean; // Alternative prop name
}

export function SaveTemplateDialog({ 
  invoice, 
  currentInvoice,
  taxRate, 
  onSaveTemplate,
  onClose,
  open: externalOpen,
  isOpen: alternativeOpen
}: SaveTemplateDialogProps) {
  const [open, setOpen] = useState(externalOpen || alternativeOpen || false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  
  // Use either invoice or currentInvoice based on what's provided
  const invoiceData = invoice || currentInvoice;
  
  const handleSave = () => {
    if (!templateName.trim() || !invoiceData) return;
    
    // Create template with correct property names
    const template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'> = {
      name: templateName,
      description: templateDescription || "",
      defaultTaxRate: taxRate,
      defaultDueDateDays: 30, // Default value
      defaultNotes: invoiceData.notes || "",
      defaultItems: invoiceData.items || [],
      // Include snake_case aliases for compatibility
      default_tax_rate: taxRate,
      default_due_date_days: 30,
      default_notes: invoiceData.notes || ""
    };
    
    onSaveTemplate(template);
    setOpen(false);
    if (onClose) onClose();
    resetForm();
  };
  
  const resetForm = () => {
    setTemplateName("");
    setTemplateDescription("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };
  
  return (
    <Dialog open={externalOpen !== undefined ? externalOpen : alternativeOpen !== undefined ? alternativeOpen : open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="Enter template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              placeholder="Enter template description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                if (onClose) onClose();
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Template</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
