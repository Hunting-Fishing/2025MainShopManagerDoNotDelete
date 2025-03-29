
import { useParams } from "react-router-dom";
import { InvoiceDetailsHeader } from "@/components/invoices/InvoiceDetailsHeader";
import { InvoiceDetailsContent } from "@/components/invoices/InvoiceDetailsContent";

// Mock data - in a real app would be fetched based on ID
const invoiceData = {
  id: "INV-2023-001",
  workOrderId: "WO-2023-0012",
  customer: "Acme Corporation",
  customerAddress: "123 Business Park, Suite 400, San Francisco, CA 94107",
  customerEmail: "billing@acmecorp.com",
  description: "HVAC System Repair",
  notes: "All work completed according to specifications. 1-year warranty on parts and labor.",
  total: 1250.00,
  subtotal: 1150.00,
  tax: 100.00,
  status: "paid",
  paymentMethod: "Credit Card",
  date: "2023-08-16",
  dueDate: "2023-09-15",
  createdBy: "Michael Brown",
  items: [
    { id: "1", name: "HVAC Filter - Premium", description: "High-efficiency particulate air filter", quantity: 2, price: 24.99, total: 49.98 },
    { id: "2", name: "Service Labor", description: "Technician hours for system repair and maintenance", quantity: 6, hours: true, price: 200.00, total: 1200.00 }
  ],
  assignedStaff: []
};

// Status styling
const statusStyles = {
  "paid": { label: "Paid", classes: "bg-green-100 text-green-800" },
  "pending": { label: "Pending", classes: "bg-yellow-100 text-yellow-800" },
  "overdue": { label: "Overdue", classes: "bg-red-100 text-red-800" },
  "draft": { label: "Draft", classes: "bg-slate-100 text-slate-800" },
};

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch invoice data based on ID
  const invoice = invoiceData;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <InvoiceDetailsHeader 
        invoiceId={invoice.id}
        status={invoice.status}
        statusStyles={statusStyles}
        invoice={invoice}
      />
      
      {/* Content */}
      <InvoiceDetailsContent 
        invoice={invoice}
        statusStyles={statusStyles}
      />
    </div>
  );
}
