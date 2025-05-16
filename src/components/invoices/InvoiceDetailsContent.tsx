
import { Separator } from "@/components/ui/separator";
import { InvoiceDetailsCompanyInfo } from "./InvoiceDetailsCompanyInfo";
import { InvoiceDetailsCustomerInfo } from "./InvoiceDetailsCustomerInfo";
import { InvoiceDetailsItemsTable } from "./InvoiceDetailsItemsTable";
import { InvoiceDetailsNotes } from "./InvoiceDetailsNotes";
import { InvoiceDetailsPaymentInfo } from "./InvoiceDetailsPaymentInfo";
import { Invoice } from "@/types/invoice";

interface InvoiceDetailsContentProps {
  invoice: Invoice & { 
    subtotal: number;
    tax: number;
    total: number;
    hours?: boolean;
    paymentMethod: string;
    customer_id?: string;
  };
  statusStyles: {
    [key: string]: { label: string; classes: string };
  };
}

export function InvoiceDetailsContent({
  invoice,
  statusStyles,
}: InvoiceDetailsContentProps) {
  const companyInfo = {
    companyName: "Easy Shop Manager",
    companyDescription: "Work Order System",
    companyAddress: "123 Main Street, Anytown, CA 12345",
    companyPhone: "(555) 123-4567",
    companyEmail: "billing@easyshopmanager.com",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-5xl mx-auto">
      {/* Invoice header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">INVOICE</h2>
          <p className="text-slate-500">{invoice.id}</p>
          <div className="mt-4">
            <p className="font-medium">Date Issued: {invoice.date}</p>
            <p className="font-medium">Due Date: {invoice.due_date || invoice.dueDate}</p>
          </div>
        </div>
        
        <InvoiceDetailsCompanyInfo 
          companyName={companyInfo.companyName}
          companyDescription={companyInfo.companyDescription}
          companyAddress={companyInfo.companyAddress}
          companyPhone={companyInfo.companyPhone}
          companyEmail={companyInfo.companyEmail}
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Customer info and work order reference */}
      <InvoiceDetailsCustomerInfo 
        customer={invoice.customer}
        customerAddress={invoice.customer_address || invoice.customerAddress || ''}
        customerEmail={invoice.customer_email || invoice.customerEmail || ''}
        workOrderId={invoice.work_order_id || invoice.workOrderId}
        description={invoice.description}
      />
      
      {/* Items table */}
      <InvoiceDetailsItemsTable 
        items={invoice.items || []}
        subtotal={invoice.subtotal || 0}
        tax={invoice.tax || 0}
        total={invoice.total || 0}
      />
      
      {/* Notes */}
      <InvoiceDetailsNotes notes={invoice.notes} />
      
      {/* Payment information */}
      <InvoiceDetailsPaymentInfo 
        paymentMethod={invoice.paymentMethod || invoice.payment_method || "N/A"}
        status={invoice.status}
        statusLabel={statusStyles[invoice.status as keyof typeof statusStyles].label}
        createdBy={invoice.created_by || invoice.createdBy || ""}
        customerId={invoice.customer_id}
      />
      
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
