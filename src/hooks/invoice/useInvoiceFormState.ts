
import { useState } from "react";
import { Invoice, InvoiceItem, StaffMember } from "@/types/invoice";

export interface UseInvoiceFormStateProps {
  initialWorkOrderId?: string;
}

const createEmptyInvoice = (workOrderId?: string): Invoice => ({
  id: crypto.randomUUID(),
  number: '',
  customer: '',
  status: 'draft',
  issue_date: new Date().toISOString(),
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  subtotal: 0,
  tax: 0,
  tax_rate: 0,
  total: 0,
  notes: '',
  created_by: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  work_order_id: workOrderId || '',
  assignedStaff: []
});

export const useInvoiceFormState = (props?: UseInvoiceFormStateProps) => {
  const [invoice, setInvoice] = useState<Invoice>(() => 
    createEmptyInvoice(props?.initialWorkOrderId)
  );
  
  return {
    invoice,
    setInvoice
  };
};
