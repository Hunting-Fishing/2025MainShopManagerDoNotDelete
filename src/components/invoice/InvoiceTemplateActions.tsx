
import { InvoiceTemplateDialog } from "../invoices/templates/InvoiceTemplateDialog";
import { SaveTemplateDialog } from "../invoices/SaveTemplateDialog";
import { Invoice } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/invoice";
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates";

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
    } else if (createTemplate) {
      createTemplate(template);
    }
  };

  // Use the provided handlers or the default ones from the hook
  const handleTemplateSelect = onSelectTemplate || handleApplyTemplate;
  const handleTemplateSave = onSaveTemplate || handleSaveTemplate;

  // Map the templates from useInvoiceTemplates to the expected format
  const mappedTemplates = templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    default_tax_rate: template.default_tax_rate,
    default_due_date_days: template.default_due_date_days,
    default_notes: template.default_notes,
    usage_count: template.usage_count,
    createdAt: template.created_at,
    lastUsed: template.last_used,
    defaultItems: []
  }));

  return (
    <div className="flex gap-2">
      <InvoiceTemplateDialog 
        templates={mappedTemplates} 
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
