
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Invoice, StaffMember } from "@/types/invoice";
import { UseInvoiceFormStateProps } from "@/hooks/useInvoiceForm";

export const useInvoiceFormState = ({ initialWorkOrderId }: UseInvoiceFormStateProps = {}) => {
  const [invoice, setInvoice] = useState<Invoice>({
    id: uuidv4(),
    number: `INV-${Date.now().toString().slice(-6)}`,
    customer: "",
    customer_id: "", // Required field
    status: "draft",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax_rate: 0.08,
    tax: 0,
    total: 0,
    notes: "",
    work_order_id: initialWorkOrderId || "",
    assignedStaff: [],
    items: [] // Required field
  });

  return {
    invoice,
    setInvoice
  };
};
