
// Add this at the beginning of the file to ensure interface compatibility
export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  default_tax_rate?: number;
  default_due_date_days?: number;
  default_notes?: string;
  usage_count: number;
  createdAt: string;
  lastUsed?: string;
  defaultItems?: any[];
}
