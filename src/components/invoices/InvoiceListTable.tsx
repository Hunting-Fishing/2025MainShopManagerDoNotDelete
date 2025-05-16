
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Download, FileEdit } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { Invoice } from "@/types/invoice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatInvoiceNumber } from "@/utils/invoiceUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceListTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export function InvoiceListTable({ invoices, isLoading = false }: InvoiceListTableProps) {
  if (isLoading) {
    return <InvoiceListSkeleton />;
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No invoices found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[100px]">Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoice_number || formatInvoiceNumber(invoice.id)}
              </TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(invoice.total || 0)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link to={`/invoices/${invoice.id}`}>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                    </Link>
                    <Link to={`/invoices/${invoice.id}/edit`}>
                      <DropdownMenuItem>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </Link>
                    <Link to={`/invoices/${invoice.id}/print`} target="_blank">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Print
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const statusClasses = {
    draft: "bg-slate-100 text-slate-800 border-slate-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-slate-100 text-slate-800 border-slate-200",
    void: "bg-slate-100 text-slate-800 border-slate-200",
    sent: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const statusLabels = {
    draft: "Draft",
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
    void: "Void",
    sent: "Sent",
  };

  const classes = statusClasses[status as keyof typeof statusClasses] || statusClasses.draft;
  const label = statusLabels[status as keyof typeof statusLabels] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

function InvoiceListSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[100px]">Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default InvoiceListTable;
