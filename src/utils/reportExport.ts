
import { jsPDF } from "jspdf";
import { utils, write } from "xlsx";
import { Parser } from "@json2csv/plainjs";
import 'jspdf-autotable';

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Formats the current date as YYYY-MM-DD
 */
const getFormattedDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Export data as CSV
 */
export const exportToCSV = (data: any[], title: string) => {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    
    // Create a blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_${getFormattedDate()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export as CSV:', err);
    throw new Error('Failed to export as CSV');
  }
};

/**
 * Export data as Excel
 */
export const exportToExcel = (data: any[], title: string) => {
  try {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Generate file and trigger download
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${getFormattedDate()}.xlsx`;
    link.click();
  } catch (err) {
    console.error('Failed to export as Excel:', err);
    throw new Error('Failed to export as Excel');
  }
};

/**
 * Export data as PDF
 */
export const exportToPDF = (data: any[], title: string, columns: { header: string, dataKey: string }[]) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Create table
    doc.autoTable({
      startY: 40,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey] !== undefined ? row[col.dataKey] : '')),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
    });
    
    // Save PDF
    doc.save(`${title}_${getFormattedDate()}.pdf`);
  } catch (err) {
    console.error('Failed to export as PDF:', err);
    throw new Error('Failed to export as PDF');
  }
};

/**
 * Export multiple Excel worksheets
 */
export const exportMultiSheetExcel = (data: Record<string, any[]>, title: string) => {
  try {
    const workbook = utils.book_new();
    
    // Add each data set as a separate worksheet
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheet = utils.json_to_sheet(sheetData);
      utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    // Generate file and trigger download
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${getFormattedDate()}.xlsx`;
    link.click();
  } catch (err) {
    console.error('Failed to export multi-sheet Excel:', err);
    throw new Error('Failed to export as Excel');
  }
};
