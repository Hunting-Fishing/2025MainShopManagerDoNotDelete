
import { Invoice } from "@/types/invoice";
import { InvoiceListExportMenu } from "./InvoiceListExportMenu";
import { InvoiceListTable } from "./InvoiceListTable";

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <div className="space-y-4">
      {invoices.length > 0 && (
        <div className="flex justify-end mb-4">
          <InvoiceListExportMenu invoices={invoices} />
        </div>
      )}
      
      <InvoiceListTable invoices={invoices} />
    </div>
  );
}
