
import { jsPDF } from "jspdf";
import { utils, write } from "xlsx";
import { Parser } from "json2csv";
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
      body: data.map(row => columns.map(col => row[col.dataKey])),
    });
    
    // Save PDF
    doc.save(`${title}_${getFormattedDate()}.pdf`);
  } catch (err) {
    console.error('Failed to export as PDF:', err);
  }
};
