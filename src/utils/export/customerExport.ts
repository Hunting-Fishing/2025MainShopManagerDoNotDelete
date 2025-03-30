
import { Customer } from "@/types/customer";
import { formatPhoneNumber } from "@/utils/formatters";

/**
 * Converts a customer object to vCard format (VCF)
 * @param customer The customer object to convert
 * @returns String in vCard format
 */
export const customerToVcard = (customer: Customer): string => {
  // Build the vCard data
  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${customer.first_name} ${customer.last_name}`,
    `N:${customer.last_name};${customer.first_name};;;`,
  ];

  // Add optional fields if they exist
  if (customer.company) {
    vcardLines.push(`ORG:${customer.company}`);
  }

  if (customer.email) {
    vcardLines.push(`EMAIL;type=INTERNET;type=WORK:${customer.email}`);
  }

  if (customer.phone) {
    // Format the phone number without any special characters for vCard
    const cleanPhone = customer.phone.replace(/\D/g, '');
    vcardLines.push(`TEL;type=CELL:${cleanPhone}`);
  }

  if (customer.address) {
    // For simplicity, we're just using the full address string
    // In a real implementation, you might want to parse the address into components
    vcardLines.push(`ADR;type=WORK:;;${customer.address};;;;`);
  }

  // Add notes if present
  if (customer.notes) {
    vcardLines.push(`NOTE:${customer.notes.replace(/\n/g, '\\n')}`);
  }

  // Add a unique identifier and closing tag
  vcardLines.push(`UID:${customer.id}`);
  vcardLines.push('END:VCARD');

  // Join with CRLF as required by the vCard spec
  return vcardLines.join('\r\n');
};

/**
 * Prepares customer data for CSV export
 * @param customers Array of customer objects
 * @returns Array of objects ready for CSV conversion
 */
export const prepareCustomersForCsv = (customers: Customer[]): any[] => {
  return customers.map(customer => ({
    'First Name': customer.first_name,
    'Last Name': customer.last_name,
    'Email': customer.email || '',
    'Phone': customer.phone ? formatPhoneNumber(customer.phone) : '',
    'Address': customer.address || '',
    'Company': customer.company || '',
    'Tags': customer.tags ? customer.tags.join(', ') : '',
    'Notes': customer.notes || '',
    'Created At': customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '',
  }));
};

/**
 * Converts a single customer to a printable HTML format
 * @param customer The customer to convert
 * @returns HTML string representing the customer details
 */
export const customerToPrintableHtml = (customer: Customer): string => {
  const fullName = `${customer.first_name} ${customer.last_name}`;
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">${fullName}</h1>
  `;
  
  if (customer.company) {
    html += `<p><strong>Company:</strong> ${customer.company}</p>`;
  }
  
  html += `<div style="margin-top: 20px;">
    <h2 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Contact Information</h2>
  `;
  
  if (customer.phone) {
    html += `<p><strong>Phone:</strong> ${formatPhoneNumber(customer.phone)}</p>`;
  }
  
  if (customer.email) {
    html += `<p><strong>Email:</strong> ${customer.email}</p>`;
  }
  
  if (customer.address) {
    html += `<p><strong>Address:</strong> ${customer.address}</p>`;
  }
  
  html += `</div>`;
  
  if (customer.tags && customer.tags.length > 0) {
    html += `
      <div style="margin-top: 20px;">
        <h2 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Tags</h2>
        <p>${customer.tags.join(', ')}</p>
      </div>
    `;
  }
  
  if (customer.vehicles && customer.vehicles.length > 0) {
    html += `
      <div style="margin-top: 20px;">
        <h2 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Vehicles</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Year</th>
              <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Make</th>
              <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Model</th>
              <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">VIN</th>
              <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">License Plate</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    customer.vehicles.forEach(vehicle => {
      html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.year || ''}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.make || ''}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.model || ''}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.vin || ''}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.license_plate || ''}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  if (customer.notes) {
    html += `
      <div style="margin-top: 20px;">
        <h2 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Notes</h2>
        <p style="white-space: pre-wrap;">${customer.notes}</p>
      </div>
    `;
  }
  
  html += `
      <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
        <p>Printed on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
  
  return html;
};
