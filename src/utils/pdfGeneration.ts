
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Invoice } from "@/types/invoice";
import { WorkOrder } from "@/data/workOrdersData";
import { formatTimeInHoursAndMinutes } from "@/data/workOrdersData";

// Configure PDF document with company branding
const configurePdf = (doc: jsPDF, title: string) => {
  // Set default properties
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80); // Dark blue color for headings
  
  // Add title
  doc.text(title, 14, 22);
  
  // Add company info - this could be imported from a settings file in a real app
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Auto Shop Management System", 14, 32);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);
  
  // Add a subtle header line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);
  
  return doc;
};

// Add footer with page numbers
const addFooter = (doc: jsPDF) => {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Auto Shop Management System`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: "center" }
    );
  }
  
  return doc;
};

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

/**
 * Generate a detailed work order PDF with better formatting
 */
export const generateWorkOrderPdf = (workOrder: WorkOrder) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Configure document with branding
  configurePdf(doc, `Work Order #${workOrder.id}`);
  
  // Add customer information
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Customer:", 14, 50);
  doc.setFontSize(10);
  doc.text(workOrder.customer, 14, 55);
  doc.text(workOrder.location || "", 14, 60);
  
  // Add work order details
  doc.setFontSize(11);
  doc.text("Work Order Details:", 120, 50);
  doc.setFontSize(10);
  doc.text(`Date: ${workOrder.date}`, 120, 55);
  doc.text(`Due Date: ${workOrder.dueDate}`, 120, 60);
  doc.text(`Status: ${workOrder.status.toUpperCase()}`, 120, 65);
  doc.text(`Priority: ${workOrder.priority.toUpperCase()}`, 120, 70);
  doc.text(`Technician: ${workOrder.technician}`, 120, 75);
  
  // Add description section
  doc.setFontSize(11);
  doc.text("Description:", 14, 75);
  doc.setFontSize(10);
  
  // Wrap text to ensure it fits within page
  const splitDescription = doc.splitTextToSize(workOrder.description || "No description provided", 180);
  doc.text(splitDescription, 14, 80);
  
  let currentY = 90 + (splitDescription.length - 1) * 5;
  
  // Add inventory items if available
  if (workOrder.inventoryItems && workOrder.inventoryItems.length > 0) {
    doc.setFontSize(11);
    doc.text("Parts & Inventory:", 14, currentY);
    currentY += 5;
    
    doc.autoTable({
      startY: currentY,
      head: [['Item', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Total']],
      body: workOrder.inventoryItems.map(item => [
        item.name,
        item.sku,
        item.category,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${(item.quantity * item.unitPrice).toFixed(2)}`
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: currentY, right: 14, bottom: 20, left: 14 },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Add time entries if available
  if (workOrder.timeEntries && workOrder.timeEntries.length > 0) {
    doc.setFontSize(11);
    doc.text("Time Entries:", 14, currentY);
    currentY += 5;
    
    doc.autoTable({
      startY: currentY,
      head: [['Technician', 'Start Time', 'End Time', 'Duration', 'Billable', 'Notes']],
      body: workOrder.timeEntries.map(entry => [
        entry.employeeName,
        new Date(entry.startTime).toLocaleString(),
        entry.endTime ? new Date(entry.endTime).toLocaleString() : 'Ongoing',
        formatTimeInHoursAndMinutes(entry.duration),
        entry.billable ? 'Yes' : 'No',
        entry.notes || ''
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: currentY, right: 14, bottom: 20, left: 14 },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Add notes section
  if (workOrder.notes) {
    doc.setFontSize(11);
    doc.text("Notes:", 14, currentY);
    currentY += 5;
    
    // Wrap notes text to ensure it fits within page
    const splitNotes = doc.splitTextToSize(workOrder.notes, 180);
    doc.text(splitNotes, 14, currentY);
    
    currentY += splitNotes.length * 5 + 5;
  }
  
  // Add billable time summary if available
  if (workOrder.totalBillableTime) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Billable Time: ${formatTimeInHoursAndMinutes(workOrder.totalBillableTime)}`, 14, currentY);
    doc.setFont(undefined, 'normal');
  }
  
  // Add signature areas
  currentY += 20;
  doc.setFontSize(10);
  doc.text("Customer Signature: _______________________________", 14, currentY);
  doc.text("Date: _______________", 130, currentY);
  
  currentY += 15;
  doc.text("Technician Signature: _______________________________", 14, currentY);
  doc.text("Date: _______________", 130, currentY);
  
  // Add footer
  addFooter(doc);
  
  return doc;
};

/**
 * Generate a report PDF with better formatting and charts
 */
export const generateReportPdf = (
  title: string, 
  data: any[], 
  columns: { header: string, dataKey: string }[],
  summaryData?: Record<string, any>,
  chartUrl?: string
) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Configure document with branding
  configurePdf(doc, title);
  
  // Add report summary if provided
  let startY = 50;
  if (summaryData) {
    doc.setFontSize(11);
    doc.text("Report Summary:", 14, startY);
    startY += 5;
    
    doc.setFontSize(10);
    Object.entries(summaryData).forEach(([key, value], index) => {
      const displayValue = typeof value === 'number' ? value.toFixed(2) : value.toString();
      doc.text(`${key}: ${displayValue}`, 14, startY + (index * 5));
    });
    
    startY += Object.keys(summaryData).length * 5 + 10;
  }
  
  // Add chart image if provided (from a base64 URL)
  if (chartUrl) {
    try {
      doc.addImage(chartUrl, 'PNG', 14, startY, 180, 80);
      startY += 90;
    } catch (err) {
      console.error('Failed to add chart image to PDF:', err);
      // Continue without the chart
    }
  }
  
  // Add data table
  doc.autoTable({
    startY: startY,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => 
      row[col.dataKey] !== undefined ? 
        (typeof row[col.dataKey] === 'number' ? 
          row[col.dataKey].toFixed(2) : 
          row[col.dataKey].toString()) : 
        ''
    )),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 139, 202] },
    alternateRowStyles: { fillColor: [249, 249, 249] },
    margin: { top: startY, right: 14, bottom: 20, left: 14 },
  });
  
  // Add generation metadata
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report generated on: ${new Date().toLocaleString()}`, 14, finalY);
  
  // Add footer
  addFooter(doc);
  
  return doc;
};

/**
 * Save or open a PDF document with proper name formatting
 */
export const savePdf = (doc: jsPDF, filename: string) => {
  const formattedFilename = `${filename}_${getFormattedDate()}.pdf`;
  doc.save(formattedFilename);
};

/**
 * Get formatted date for filename
 */
const getFormattedDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
