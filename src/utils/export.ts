
import { Parser } from '@json2csv/plainjs';
import FileSaver from 'file-saver';

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: any[], filename: string): void => {
  try {
    if (!data || !data.length) {
      throw new Error("No data to export");
    }
    
    const parser = new Parser();
    const csv = parser.parse(data);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, `${filename}.csv`);
  } catch (err) {
    console.error("Export failed:", err);
    throw err;
  }
};

/**
 * Export data to Excel file
 */
export const exportToExcel = async (data: any[], filename: string): Promise<void> => {
  try {
    // Dynamically import xlsx to reduce initial bundle size
    const XLSX = await import('xlsx');
    
    if (!data || !data.length) {
      throw new Error("No data to export");
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Generate the file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (err) {
    console.error("Excel export failed:", err);
    throw err;
  }
};

/**
 * Export data to PDF
 */
export const exportToPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Dynamically import jspdf and html2canvas
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error("PDF export failed:", err);
    throw err;
  }
};

/**
 * Export multiple data sets to Excel with multiple sheets
 */
export const exportMultiSheetExcel = async (
  dataSets: { name: string; data: any[] }[],
  filename: string
): Promise<void> => {
  try {
    // Dynamically import xlsx to reduce initial bundle size
    const XLSX = await import('xlsx');
    
    const workbook = XLSX.utils.book_new();
    
    dataSets.forEach(dataSet => {
      if (dataSet.data && dataSet.data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(dataSet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, dataSet.name);
      }
    });
    
    // Generate the file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (err) {
    console.error("Excel export failed:", err);
    throw err;
  }
};
