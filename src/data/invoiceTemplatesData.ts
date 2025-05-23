
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates";

// This file now re-exports the hook that fetches data from the database
export { useInvoiceTemplates };

// For backwards compatibility - no mock fallbacks
import { InvoiceTemplate } from "@/types/invoice";
export const invoiceTemplates: InvoiceTemplate[] = [];

export const updateTemplateUsage = async (templateId: string) => {
  throw new Error('Please use useInvoiceTemplates hook instead of deprecated function.');
};

export const createTemplate = async () => {
  throw new Error('Please use useInvoiceTemplates hook instead of deprecated function.');
};
