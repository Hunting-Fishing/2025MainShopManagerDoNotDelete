
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Invoice } from "@/types/invoice";
import { configurePdf, addFooter } from "./pdfConfig";

/**
 * Generate a detailed invoice PDF with better formatting
 */
export const generateInvoicePdf = (
  invoice: Invoice & { 
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
  }
) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Configure document with branding
  configurePdf(doc, `Invoice #${invoice.id}`);
  
  // Add customer information
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Bill To:", 14, 50);
  doc.setFontSize(10);
  doc.text(invoice.customer, 14, 55);
  doc.text(invoice.customerAddress || "", 14, 60);
  doc.text(invoice.customerEmail || "", 14, 65);
  
  // Add invoice details
  doc.setFontSize(11);
  doc.text("Invoice Details:", 120, 50);
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${invoice.date}`, 120, 55);
  doc.text(`Due Date: ${invoice.dueDate}`, 120, 60);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 120, 65);
  
  if (invoice.workOrderId) {
    doc.text(`Work Order: ${invoice.workOrderId}`, 120, 70);
  }
  
  // Add invoice items table
  doc.autoTable({
    startY: 75,
    head: [['Item', 'Description', 'Quantity', 'Price', 'Total']],
    body: invoice.items.map(item => [
      item.name,
      item.description || "",
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 139, 202] },
    footStyles: { fillColor: [245, 245, 245] },
    alternateRowStyles: { fillColor: [249, 249, 249] },
    margin: { top: 75 },
  });
  
  // Calculate where the table ended
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  
  // Add totals
  doc.setFontSize(10);
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 150, finalY + 10);
  doc.text(`Tax: $${invoice.tax.toFixed(2)}`, 150, finalY + 15);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 150, finalY + 20);
  doc.setFont(undefined, 'normal');
  
  // Add notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.text("Notes:", 14, finalY + 35);
    doc.setFontSize(9);
    
    // Wrap the notes text to ensure it fits within the page
    const splitNotes = doc.splitTextToSize(invoice.notes, 180);
    doc.text(splitNotes, 14, finalY + 40);
  }
  
  // Add payment information if available
  if (invoice.paymentMethod) {
    doc.setFontSize(10);
    doc.text(`Payment Method: ${invoice.paymentMethod}`, 14, finalY + 20);
  }
  
  // Add terms and conditions
  doc.setFontSize(8);
  const termsY = invoice.notes ? finalY + 60 : finalY + 40;
  doc.text("Terms & Conditions:", 14, termsY);
  doc.text("Payment is due by the due date. Late payments may incur additional fees.", 14, termsY + 5);
  
  // Add footer
  addFooter(doc);
  
  return doc;
};
