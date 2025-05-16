
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Parser } from "@json2csv/plainjs";

export function exportToCSV(data: any[], filename: string) {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("CSV Export Error:", error);
    throw error;
  }
}

export function exportToExcel(data: any[], filename: string) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Excel Export Error:", error);
    throw error;
  }
}

export function exportMultiSheetExcel(data: Record<string, any[]>, filename: string) {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Create a worksheet for each sheet in the data object
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Multi-Sheet Excel Export Error:", error);
    throw error;
  }
}

export function exportToPDF(data: any[], filename: string) {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(filename, 14, 22);
    
    // Get column names
    const columns = Object.keys(data[0]);
    
    // Format data for autoTable
    const rows = data.map(item => Object.values(item));
    
    // Generate the table
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  }
}
