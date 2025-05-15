
/**
 * Utility function to print a specific element
 * @param elementId The ID of the element to print
 * @param title Optional title for the print document
 */
export const printElement = (elementId: string, title?: string) => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }
  
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    console.error("Could not open print window");
    return;
  }
  
  // Get styles from the current page
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        // Skip external stylesheets
        return '';
      }
    })
    .join('\n');
  
  // Create the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Print'}</title>
        <style>
          ${styles}
          @media print {
            body {
              padding: 20px;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            @page {
              size: auto;
              margin: 10mm;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${title || 'Print Document'}</h1>
          <p>${new Date().toLocaleDateString()}</p>
        </div>
        ${element.outerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for resources to load
  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
    
    // Some browsers will automatically close the window after printing
    // For others, we'll set a timeout
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.close();
      }
    }, 1000);
  });
};
