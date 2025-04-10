
import React from 'react';
import { InvoiceStatus, Invoice } from '@/types/invoice';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters";
import { Link } from 'react-router-dom';
import { Eye, FileText, Printer } from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, isLoading }) => {
  // Status badge helper
  const renderStatusBadge = (status: InvoiceStatus) => {
    const statusStyles = {
      draft: "bg-gray-200 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={statusStyles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="py-24 text-center">
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No invoices found</h3>
        <p className="mt-1 text-gray-500">Create a new invoice to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.id.substring(0, 8)}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.dueDate}</TableCell>
              <TableCell>{formatCurrency(invoice.total)}</TableCell>
              <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="icon" variant="ghost" asChild>
                  <Link to={`/invoices/${invoice.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Link>
                </Button>
                <Button size="icon" variant="ghost">
                  <Printer className="h-4 w-4" />
                  <span className="sr-only">Print</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;
