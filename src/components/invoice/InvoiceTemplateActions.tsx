
import { InvoiceTemplateDialog } from "../invoices/InvoiceTemplateDialog";
import { SaveTemplateDialog } from "../invoices/SaveTemplateDialog";
import { Invoice } from "@/types/invoice";
import { useInvoiceTemplates } from "@/hooks/invoice/useInvoiceTemplates";

interface InvoiceTemplateActionsProps {
  invoice: Invoice;
  taxRate: number;
  onSelectTemplate?: (template: any) => void;
  onSaveTemplate?: (template: any) => void;
}

export function InvoiceTemplateActions({
  invoice,
  taxRate,
  onSelectTemplate,
  onSaveTemplate
}: InvoiceTemplateActionsProps) {
  const { 
    templates, 
    handleApplyTemplate, 
    handleSaveTemplate 
  } = useInvoiceTemplates();
  
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
