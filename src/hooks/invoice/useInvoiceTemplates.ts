
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Invoice, InvoiceTemplate, InvoiceUpdater } from "@/types/invoice";
import { invoiceTemplates, createTemplate, updateTemplateUsage } from "@/data/invoiceTemplatesData";
import { v4 as uuidv4 } from "uuid";

export function useInvoiceTemplates(updateInvoice: (updater: InvoiceUpdater) => void) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(invoiceTemplates);

  // Handle applying a template
  const handleApplyTemplate = (template: InvoiceTemplate) => {
    const currentDate = new Date();
    const dueDate = new Date(currentDate);
    dueDate.setDate(dueDate.getDate() + template.defaultDueDateDays);
    
    // Generate new IDs for each item to ensure uniqueness
    const itemsWithNewIds = template.defaultItems.map(item => ({
      ...item,
      id: uuidv4()
    }));
    
    updateInvoice((prev) => ({
      ...prev,
      notes: template.defaultNotes || prev.notes,
      dueDate: dueDate.toISOString().split('T')[0],
      items: itemsWithNewIds
    }));
    
    // Update the template usage stats
    updateTemplateUsage(template.id);
    
    // Update the local state of templates
    const updatedTemplates = templates.map(t => 
      t.id === template.id 
        ? { ...t, lastUsed: new Date().toISOString(), usageCount: t.usageCount + 1 }
        : t
    );
    setTemplates(updatedTemplates);
    
    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template to your invoice.`
    });
  };

  // Handle saving a new template
  const handleSaveTemplate = (newTemplate: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    const template = createTemplate(newTemplate);
    
    // Add to templates list
    setTemplates([...templates, template]);
    
    toast({
      title: "Template Saved",
      description: `"${template.name}" template has been saved for future use.`
    });
  };

  return {
    templates,
    handleApplyTemplate,
    handleSaveTemplate
  };
}
