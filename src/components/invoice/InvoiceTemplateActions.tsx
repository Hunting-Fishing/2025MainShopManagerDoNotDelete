
import { InvoiceTemplateDialog } from "../invoices/InvoiceTemplateDialog";
import { SaveTemplateDialog } from "../invoices/SaveTemplateDialog";
import { Invoice } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/invoice";
import { useInvoiceTemplates } from "@/hooks/invoice/useInvoiceTemplates";

interface InvoiceTemplateActionsProps {
  invoice: Invoice;
  taxRate: number;
  onSelectTemplate?: (template: InvoiceTemplate) => void;
  onSaveTemplate?: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount' | 'lastUsed'>) => void;
}

export function InvoiceTemplateActions({
  invoice,
  taxRate,
  onSelectTemplate,
  onSaveTemplate
}: InvoiceTemplateActionsProps) {
  const { 
    templates,
    createTemplate,
    updateTemplate
  } = useInvoiceTemplates();
  
  // Create handler functions
  const handleApplyTemplate = (template: InvoiceTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleSaveTemplate = (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount' | 'lastUsed'>) => {
    if (onSaveTemplate) {
      onSaveTemplate(template);
    } else {
      createTemplate(template);
    }
  };

  // Use the provided handlers or the default ones from the hook
  const handleTemplateSelect = onSelectTemplate || handleApplyTemplate;
  const handleTemplateSave = onSaveTemplate || handleSaveTemplate;

  return (
    <div className="flex gap-2">
      <InvoiceTemplateDialog 
        templates={templates} 
        onSelectTemplate={handleTemplateSelect} 
      />
      <SaveTemplateDialog 
        currentInvoice={invoice} 
        taxRate={taxRate}
        onSaveTemplate={handleTemplateSave} 
      />
    </div>
  );
}
