
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import { Invoice } from "@/types/invoice";
import { toast } from "@/components/ui/use-toast";

export interface InvoiceListExportMenuProps {
  invoices: Invoice[];
}

export function InvoiceListExportMenu({ invoices }: InvoiceListExportMenuProps) {
  const handleExportCSV = () => {
    const csvContent = convertToCSV(invoices);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `invoices_${formatDate()}.csv`);
    toast({ title: "Export successful", description: "Invoices exported as CSV" });
  };

  const handleExportExcel = () => {
    const worksheet = utils.json_to_sheet(formatInvoicesForExport(invoices));
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Invoices");
    const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `invoices_${formatDate()}.xlsx`);
    toast({ title: "Export successful", description: "Invoices exported as Excel" });
  };

  const handleExportPDF = () => {
    // Simplified version - in a real app this would generate a PDF
    toast({ 
      title: "PDF Export", 
      description: "PDF export functionality would be implemented here",
      variant: "default"
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper functions
function formatInvoicesForExport(invoices: Invoice[]) {
  return invoices.map((invoice) => ({
    "Invoice #": invoice.invoice_number || invoice.id,
    Customer: invoice.customer,
    Date: formatDateForSheet(invoice.date),
    "Due Date": formatDateForSheet(invoice.due_date),
    Status: invoice.status,
    Amount: invoice.total || 0,
    "Created By": invoice.created_by || "",
  }));
}

function convertToCSV(invoices: Invoice[]): string {
  const formattedInvoices = formatInvoicesForExport(invoices);
  
  if (formattedInvoices.length === 0) {
    return '';
  }
  
  const headers = Object.keys(formattedInvoices[0]).join(',');
  const rows = formattedInvoices.map(obj => 
    Object.values(obj).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

function formatDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function formatDateForSheet(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
}
