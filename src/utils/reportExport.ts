
import { jsPDF } from "jspdf";
import { utils, write } from "xlsx";
import { Parser } from "@json2csv/plainjs";
import 'jspdf-autotable';
import { generateReportPdf, savePdf } from './pdfGeneration';

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
 * Export data as PDF with enhanced formatting
 */
export const exportToPDF = (data: any[], title: string, columns: { header: string, dataKey: string }[]) => {
  try {
    // Generate the PDF using our enhanced generator
    const doc = generateReportPdf(title, data, columns);
    
    // Save the PDF
    savePdf(doc, title);
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

/**
 * Create a full system backup (for admin use)
 */
export const createSystemBackup = (
  entityData: Record<string, any[]>, 
  filename: string = "System_Backup"
) => {
  try {
    // Check if data is provided
    if (!entityData || Object.keys(entityData).length === 0) {
      throw new Error('No data provided for backup');
    }
    
    // Create a workbook for the backup
    const workbook = utils.book_new();
    
    // Add metadata sheet with backup information
    const metadataWorksheet = utils.json_to_sheet([{
      backupDate: new Date().toISOString(),
      dataVersion: '1.0',
      systemVersion: 'Auto Shop Management System v1.0',
      totalEntities: Object.keys(entityData).length,
      totalRecords: Object.values(entityData).reduce((acc, val) => acc + val.length, 0)
    }]);
    utils.book_append_sheet(workbook, metadataWorksheet, 'Backup_Metadata');
    
    // Add each entity type as a separate worksheet
    Object.entries(entityData).forEach(([entityName, entityRecords]) => {
      if (entityRecords.length > 0) {
        const worksheet = utils.json_to_sheet(entityRecords);
        utils.book_append_sheet(workbook, worksheet, entityName);
      }
    });
    
    // Generate file and trigger download
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${getFormattedDate()}.xlsx`;
    link.click();
    
    return true;
  } catch (err) {
    console.error('Failed to create system backup:', err);
    throw new Error('Failed to create system backup');
  }
};
