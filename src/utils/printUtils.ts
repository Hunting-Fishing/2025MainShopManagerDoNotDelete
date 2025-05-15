
/**
 * Utility functions for printing content
 */

/**
 * Print a specific element by creating a new window with only that content
 * @param elementId The ID of the element to print
 * @param title Optional title for the print page
 */
export const printElement = (elementId: string, title: string = 'Print') => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return;
  }
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print this content');
    return;
  }
  
  // Create print-friendly styles
  const styles = `
    @page {
      size: auto;
      margin: 20mm 10mm;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #000;
      background: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .print-header {
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .print-footer {
      margin-top: 30px;
      padding-top: 10px;
      font-size: 12px;
      text-align: center;
      color: #666;
      border-top: 1px solid #eee;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .grid {
      display: grid;
    }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .rounded { border-radius: 4px; }
    .rounded-full { border-radius: 9999px; }
    .font-bold { font-weight: bold; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xs { font-size: 0.75rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .p-2 { padding: 0.5rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .text-gray-500 { color: #6b7280; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .flex { display: flex; }
    .flex-1 { flex: 1 1 0%; }
    .justify-between { justify-content: space-between; }
    .items-start { align-items: flex-start; }
    
    /* Default print dialog hides background colors, this ensures they print */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    @media print {
      button, .no-print {
        display: none;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .page-break {
        page-break-after: always;
      }
      .card {
        break-inside: avoid;
      }
    }
  `;
  
  // Get current date for the print
  const printDate = new Date().toLocaleDateString();
  
  // Setup the print document
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="print-content">
          ${element.innerHTML}
        </div>
        <div class="print-footer">
          <p>Printed on: ${printDate}</p>
          <p>This document is for internal use only.</p>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = () => {
    // Execute print after a small delay to ensure all content is rendered
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};
