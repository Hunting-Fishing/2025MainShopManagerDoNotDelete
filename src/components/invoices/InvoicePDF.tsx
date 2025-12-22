
import React from "react";
import { Invoice } from "@/types/invoice";
import { formatCurrency } from "@/utils/formatters";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CompanyProfile {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface InvoicePDFProps {
  invoice: Invoice;
  company?: CompanyProfile;
}

export default function InvoicePDF({ invoice, company }: InvoicePDFProps) {
  const companyProfile: CompanyProfile = company || {
    name: "Company Name",
    address: "Address not configured",
    email: "support@company.com",
    phone: "",
  };

  const buildPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("INVOICE", 14, 18);

    doc.setFontSize(10);
    doc.text(`Invoice #${invoice.id}`, 14, 26);
    doc.text(`Date: ${invoice.date || "N/A"}`, 14, 32);
    doc.text(`Due Date: ${invoice.due_date || "N/A"}`, 14, 38);

    doc.setFontSize(10);
    doc.text(companyProfile.name, 150, 18, { align: "right" });
    if (companyProfile.address) {
      doc.text(companyProfile.address, 150, 24, { align: "right" });
    }
    if (companyProfile.email) {
      doc.text(companyProfile.email, 150, 30, { align: "right" });
    }
    if (companyProfile.phone) {
      doc.text(companyProfile.phone, 150, 36, { align: "right" });
    }

    doc.setFontSize(10);
    doc.text("Bill To:", 14, 50);
    doc.text(invoice.customer || "Unknown", 14, 56);
    if (invoice.customer_email) doc.text(invoice.customer_email, 14, 62);
    if (invoice.customer_address) doc.text(invoice.customer_address, 14, 68);

    const tableBody = (invoice.items || []).map((item) => [
      item.name,
      item.hours ? `${item.quantity} hr` : `${item.quantity}`,
      formatCurrency(item.price),
      formatCurrency(item.total),
    ]);

    autoTable(doc, {
      startY: 76,
      head: [["Item", "Quantity", "Price", "Total"]],
      body: tableBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [240, 240, 240] },
    });

    const summaryY = (doc as any).lastAutoTable?.finalY || 120;
    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 140, summaryY + 8);
    doc.text(`Tax: ${formatCurrency(invoice.tax)}`, 140, summaryY + 14);
    doc.setFontSize(11);
    doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, summaryY + 22);

    if (invoice.notes) {
      doc.setFontSize(10);
      doc.text("Notes:", 14, summaryY + 30);
      doc.text(String(invoice.notes), 14, summaryY + 36);
    }

    return doc;
  };

  const handleDownload = () => {
    const doc = buildPdf();
    doc.save(`invoice-${invoice.id}.pdf`);
  };

  const handlePrint = () => {
    const doc = buildPdf();
    const blobUrl = doc.output("bloburl");
    const printWindow = window.open(blobUrl, "_blank");
    if (printWindow) {
      printWindow.focus();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          Print
        </button>
      </div>

      <div className="p-8 bg-white">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">INVOICE</h1>
          <p>Invoice #{invoice.id}</p>
          <p>Date: {invoice.date}</p>
          <p>Due Date: {invoice.due_date}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold">{companyProfile.name}</h2>
          {companyProfile.address && <p>{companyProfile.address}</p>}
          {companyProfile.email && <p>{companyProfile.email}</p>}
          {companyProfile.phone && <p>{companyProfile.phone}</p>}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="font-bold mb-2">Bill To:</h2>
        <p>{invoice.customer}</p>
        {invoice.customer_email && <p>{invoice.customer_email}</p>}
        {invoice.customer_address && <p>{invoice.customer_address}</p>}
      </div>
      
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">Item</th>
            <th className="text-right p-2 border">Quantity</th>
            <th className="text-right p-2 border">Price</th>
            <th className="text-right p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.map((item, index) => (
            <tr key={index}>
              <td className="p-2 border">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </td>
              <td className="p-2 border text-right">
                {item.hours ? `${item.quantity} hr` : item.quantity}
              </td>
              <td className="p-2 border text-right">
                {formatCurrency(item.price)}
              </td>
              <td className="p-2 border text-right">
                {formatCurrency(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax ({(invoice.tax / invoice.subtotal * 100).toFixed(0)}%)</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>
      
      {invoice.notes && (
        <div className="mb-8">
          <h2 className="font-bold mb-2">Notes</h2>
          <p>{invoice.notes}</p>
        </div>
      )}
      
      <div>
        <p className="text-center text-gray-500">Thank you for your business!</p>
      </div>
      </div>
    </div>
  );
}
