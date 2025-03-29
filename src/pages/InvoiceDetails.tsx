
import { useParams } from "react-router-dom";
import { InvoiceDetailsHeader } from "@/components/invoices/InvoiceDetailsHeader";
import { InvoiceDetailsContent } from "@/components/invoices/InvoiceDetailsContent";
import { invoices } from "@/data/invoiceData";
import { Invoice } from "@/types/invoice";

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
  const invoice = invoices.find(inv => inv.id === id) || invoices[0];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <InvoiceDetailsHeader 
        invoiceId={invoice.id}
        status={invoice.status}
        statusStyles={statusStyles}
        invoice={invoice as Invoice & { 
          subtotal: number;
          tax: number;
          total: number;
          paymentMethod: string;
        }}
      />
      
      {/* Content */}
      <InvoiceDetailsContent 
        invoice={invoice as Invoice & { 
          subtotal: number;
          tax: number;
          total: number;
          hours?: boolean;
          paymentMethod: string;
        }}
        statusStyles={statusStyles}
      />
    </div>
  );
}
