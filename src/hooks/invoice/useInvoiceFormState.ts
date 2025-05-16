
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceStatus } from '@/types/invoice';

export const useInvoiceFormState = (initialData?: Partial<Invoice>) => {
  const defaultInvoice: Invoice = {
    id: uuidv4(),
    shop_id: "",
    workOrderId: "",
    customer: "",
    customerEmail: "",
    customerAddress: "",
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: "draft" as InvoiceStatus,
    items: [],
    assignedStaff: []
  };

  const [invoice, setInvoice] = useState<Invoice>({
    ...defaultInvoice,
    ...initialData
  });

  const updateInvoice = (field: keyof Invoice, value: any) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return { invoice, updateInvoice, setInvoice };
};
