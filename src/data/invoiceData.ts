
import { useInvoiceData } from "@/hooks/useInvoiceData";

// This file now re-exports the hook that fetches data from the database
export { useInvoiceData };

// For backwards compatibility - but no mock data fallbacks
export const invoices = [];
