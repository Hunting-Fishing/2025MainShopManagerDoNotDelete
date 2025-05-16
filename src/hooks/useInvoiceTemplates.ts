
import { useState, useCallback, useEffect } from 'react';
import { InvoiceTemplate } from '@/types/invoice';
import { getInvoiceTemplates, saveInvoiceTemplate } from '@/services/invoiceService';
import { toast } from 'sonner';

export const useInvoiceTemplates = () => {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInvoiceTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching invoice templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleApplyTemplate = useCallback((template: InvoiceTemplate) => {
    // Update template usage count via service
    try {
      // In a proper implementation, we would call updateTemplateUsage
      console.log('Template used:', template.id);
    } catch (err) {
      console.error('Error updating template usage:', err);
    }
    
    return template;
  }, []);

  const handleSaveTemplate = useCallback(async (newTemplate: Omit<InvoiceTemplate, 'id' | 'created_at' | 'usage_count'>) => {
    try {
      const savedTemplate = await saveInvoiceTemplate(newTemplate);
      setTemplates(prev => [...prev, savedTemplate]);
      toast.success('Template saved successfully');
      return savedTemplate;
    } catch (err) {
      console.error('Error saving template:', err);
      toast.error('Failed to save template');
      throw err;
    }
  }, []);

  return {
    templates,
    isLoading,
    handleApplyTemplate,
    handleSaveTemplate,
    fetchTemplates
  };
};
