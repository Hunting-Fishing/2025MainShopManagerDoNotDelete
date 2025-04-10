
import { Customer } from "@/types/customer";
import { formatPhoneNumber } from "@/utils/formatters";

/**
 * Converts a customer record to vCard format
 * @param customer Customer data
 * @returns vCard formatted string
 */
export const customerToVcard = (customer: Customer): string => {
  // Start vCard
  let vcard = "BEGIN:VCARD\r\n";
  vcard += "VERSION:3.0\r\n";
  
  // Name
  const fullName = `${customer.first_name} ${customer.last_name}`;
  vcard += `FN:${fullName}\r\n`;
  vcard += `N:${customer.last_name};${customer.first_name};;;\r\n`;
  
  // Organization if available
  if (customer.company) {
    vcard += `ORG:${customer.company}\r\n`;
  }
  
  // Contact info - phone
  if (customer.phone) {
    vcard += `TEL;type=CELL:${customer.phone}\r\n`;
  }
  
  // Email
  if (customer.email) {
    vcard += `EMAIL:${customer.email}\r\n`;
  }
  
  // Address
  if (customer.address) {
    // Format: ADR:PO Box;Extended Address;Street;City;State;Postal Code;Country
    vcard += `ADR:;;${customer.address};${customer.city || ""};${customer.state || ""};${customer.postal_code || ""};${customer.country || ""}\r\n`;
  }
  
  // Notes if available
  if (customer.notes) {
    // Escape any semicolons, commas, and newlines
    const sanitizedNotes = customer.notes
      .replace(/\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
    vcard += `NOTE:${sanitizedNotes}\r\n`;
  }
  
  // End vCard
  vcard += "END:VCARD\r\n";
  
  return vcard;
};

/**
 * Generate a CSV string for customer data export
 * @param customers Array of customer data
 * @returns CSV formatted string
 */
export const customersToCSV = (customers: Customer[]): string => {
  // CSV header
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Company",
    "Address",
    "City",
    "State",
    "Postal Code",
    "Country",
    "Tags"
  ];
  
  let csv = headers.join(",") + "\r\n";
  
  // Process each customer
  customers.forEach(customer => {
    // Escape fields with quotes if they contain commas
    const escapedFields = [
      escapeCsvField(customer.first_name),
      escapeCsvField(customer.last_name),
      escapeCsvField(customer.email || ""),
      escapeCsvField(formatPhoneNumber(customer.phone || "")),
      escapeCsvField(customer.company || ""),
      escapeCsvField(customer.address || ""),
      escapeCsvField(customer.city || ""),
      escapeCsvField(customer.state || ""),
      escapeCsvField(customer.postal_code || ""),
      escapeCsvField(customer.country || ""),
      escapeCsvField(customer.tags ? customer.tags.join(", ") : "")
    ];
    
    csv += escapedFields.join(",") + "\r\n";
  });
  
  return csv;
};

/**
 * Escape CSV field according to RFC 4180
 * @param field Field content
 * @returns Escaped field
 */
const escapeCsvField = (field: string): string => {
  // If field contains commas, double quotes, or newlines, wrap in quotes and escape any double quotes
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};
