
import { InvoiceTemplateDialog } from "./InvoiceTemplateDialog";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import { Invoice, InvoiceTemplate } from "@/types/invoice";
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates";

interface InvoiceTemplateActionsProps {
  invoice: Invoice;
  taxRate: number;
  onSelectTemplate?: (template: InvoiceTemplate) => void;
  onSaveTemplate?: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
}

export function InvoiceTemplateActions({
  invoice,
  taxRate,
  onSelectTemplate,
  onSaveTemplate
}: InvoiceTemplateActionsProps) {
  const { templates, handleApplyTemplate, handleSaveTemplate } = useInvoiceTemplates();
  
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
