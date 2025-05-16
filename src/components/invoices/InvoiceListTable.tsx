
import React from "react";
import { Link } from "react-router-dom";
import { Invoice } from "@/types/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { formatCurrency } from "@/utils/formatters";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface InvoiceListTableProps {
  invoices: Invoice[];
  onSelectInvoice?: (invoice: Invoice) => void;
}

export function InvoiceListTable({ 
  invoices,
  onSelectInvoice
}: InvoiceListTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-muted-foreground">No invoices found</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-2 text-left font-medium text-muted-foreground">Invoice #</th>
            <th className="p-2 text-left font-medium text-muted-foreground">Customer</th>
            <th className="p-2 text-left font-medium text-muted-foreground">Date</th>
            <th className="p-2 text-left font-medium text-muted-foreground">Due Date</th>
            <th className="p-2 text-left font-medium text-muted-foreground">Amount</th>
            <th className="p-2 text-left font-medium text-muted-foreground">Status</th>
            <th className="p-2 text-left font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr 
              key={invoice.id} 
              className="border-b border-border hover:bg-muted/30 cursor-pointer"
              onClick={() => onSelectInvoice && onSelectInvoice(invoice)}
            >
              <td className="p-2 font-medium">
                <div className="flex items-center">
                  {invoice.workOrderId && (
                    <span className="mr-2 px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-800 border border-amber-300">
                      WO
                    </span>
                  )}
                  {invoice.id}
                </div>
              </td>
              <td className="p-2">{invoice.customer}</td>
              <td className="p-2">
                {invoice.date ? format(new Date(invoice.date), "MMM d, yyyy") : "—"}
              </td>
              <td className="p-2">
                {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "—"}
              </td>
              <td className="p-2 font-mono">
                {formatCurrency(invoice.total)}
              </td>
              <td className="p-2">
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td className="p-2">
                <div className="flex space-x-2">
                  <Link 
                    to={`/invoices/${invoice.id}`}
                    className="text-primary hover:text-primary/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </Link>
                  <Link 
                    to={`/invoices/${invoice.id}/edit`}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
