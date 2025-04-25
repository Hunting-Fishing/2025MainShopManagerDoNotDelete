
import { InvoiceTemplateDialog } from "./InvoiceTemplateDialog";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import { Invoice } from "@/types/invoice";
import { convertToTemplateItems } from "@/types/invoice";

interface InvoiceTemplateActionsProps {
  invoice: Invoice;
  taxRate: number;
  templates: any[]; // Use the correct type from your hooks
  onSelectTemplate: (template: any) => void;
  onSaveTemplate: (template: any) => void;
}

export function InvoiceTemplateActions({
  invoice,
  taxRate,
  templates,
  onSelectTemplate,
  onSaveTemplate
}: InvoiceTemplateActionsProps) {
  // Helper to adapt template for saving
  const handleSaveTemplate = (templateData: any) => {
    // Convert invoice items to template items
    const convertedItems = convertToTemplateItems(invoice.items);
    
    // Create the final template object
    const template = {
      ...templateData,
      defaultItems: convertedItems
    };
    
    onSaveTemplate(template);
  };

  return (
    <div className="flex gap-2">
      <InvoiceTemplateDialog 
        templates={templates} 
        onSelectTemplate={onSelectTemplate} 
      />
      <SaveTemplateDialog 
        currentInvoice={invoice} 
        taxRate={taxRate}
        onSaveTemplate={handleSaveTemplate} 
      />
    </div>
  );
}
