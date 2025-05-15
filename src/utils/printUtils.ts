
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
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #000;
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
    }
    .print-footer {
      margin-top: 30px;
      font-size: 12px;
      text-align: center;
      color: #666;
    }
    @media print {
      button {
        display: none;
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
        <div class="print-header">
          <h1>${title}</h1>
          <p>Printed on: ${printDate}</p>
        </div>
        <div id="print-content">
          ${element.innerHTML}
        </div>
        <div class="print-footer">
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
