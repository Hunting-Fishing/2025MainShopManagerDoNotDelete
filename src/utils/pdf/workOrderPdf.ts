
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { WorkOrder } from "@/types/workOrder";
import { formatTimeInHoursAndMinutes } from "@/utils/dateUtils";
import { configurePdf, addFooter } from "./pdfConfig";

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
