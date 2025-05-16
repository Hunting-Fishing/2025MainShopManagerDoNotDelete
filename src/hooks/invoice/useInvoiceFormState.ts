
import { useState } from "react";
import { Invoice, StaffMember } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItemExtended } from "@/types/inventory";

export function useInvoiceFormState() {
  const [invoice, setInvoice] = useState<Invoice>({
    id: `INV-${Date.now().toString().slice(-6)}`,
    customer: "",
    customer_address: "",
    customer_email: "",
    status: "draft",
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    work_order_id: "",
    items: [],
    assignedStaff: [],
    created_by: "",
    notes: "",
  });

  return { invoice, setInvoice };
}
