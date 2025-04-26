
import { useState } from "react";
import { InvoiceTemplateDialog } from "./InvoiceTemplateDialog";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import { Invoice, InvoiceTemplate } from "@/types/invoice";

interface InvoiceTemplateActionsProps {
  invoice: Invoice;
  taxRate: number;
  onSelectTemplate: (template: InvoiceTemplate) => void;
  onSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usage_count" | "last_used">) => void;
}

export function InvoiceTemplateActions({
  invoice,
  taxRate,
  onSelectTemplate,
  onSaveTemplate
}: InvoiceTemplateActionsProps) {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Helper to adapt template for saving
  const handleSaveTemplate = (templateData: any) => {
    // Create the final template object
    const template = {
      ...templateData,
      // Map any necessary fields if needed
    };
    
    onSaveTemplate(template);
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => setTemplateDialogOpen(true)}
        variant="outline" 
        size="sm"
      >
        Apply Template
      </Button>
      
      <Button
        onClick={() => setSaveDialogOpen(true)}
        variant="outline"
        size="sm"
      >
        Save as Template
      </Button>

      <InvoiceTemplateDialog 
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        templates={[]} 
        onSelectTemplate={onSelectTemplate} 
      />
      
      <SaveTemplateDialog 
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        currentInvoice={invoice} 
        taxRate={taxRate}
        onSaveTemplate={handleSaveTemplate} 
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
