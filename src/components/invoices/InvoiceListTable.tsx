
import React from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from '@/types/invoice';
import { formatDate, formatCurrency } from '@/lib/utils';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { File, FileText, ExternalLink, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface InvoiceListTableProps {
  invoices: Invoice[];
}

export const InvoiceListTable: React.FC<InvoiceListTableProps> = ({ invoices }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-200/50';
      case 'overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-200/50';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200/50';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200/50';
      case 'void':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200/50';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 hover:bg-rose-200/50';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200/50';
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium">No invoices found</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          No invoices match your current filters or there are no invoices created yet.
        </p>
        <Link to="/invoices/new">
          <Button>
            Create Invoice
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <div className="flex items-center">
                  <File className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Link 
                    to={`/invoices/${invoice.id}`}
                    className="font-medium hover:underline"
                  >
                    {invoice.invoice_number || `INV-${invoice.id.substring(0, 8)}`}
                  </Link>
                </div>
                {invoice.workOrderId && (
                  <div className="mt-1">
                    <Link 
                      to={`/work-orders/${invoice.workOrderId}`}
                      className="text-xs text-blue-600 hover:underline flex items-center"
                    >
                      <span>Work Order</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                )}
              </TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>{formatDate(invoice.date || '')}</TableCell>
              <TableCell>{formatDate(invoice.dueDate || '')}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(invoice.status)} variant="outline">
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(invoice.total)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link to={`/invoices/${invoice.id}`} className="w-full">View</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to={`/invoices/edit/${invoice.id}`} className="w-full">Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                    <DropdownMenuItem>Email Invoice</DropdownMenuItem>
                    <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
