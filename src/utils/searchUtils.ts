
import { workOrders } from "@/data/workOrdersData";
import { invoices } from "@/data/invoiceData";
import { customers } from "@/data/customersData";
import { equipment } from "@/data/equipmentData";
import { inventoryItems } from "@/data/mockInventoryData";

// Define the search result types
export type SearchResultType = 'work-order' | 'invoice' | 'customer' | 'equipment' | 'inventory';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: SearchResultType;
  url: string;
}

// Perform a search across all data sources
export const performSearch = (query: string): SearchResult[] => {
  if (!query || query.trim() === '') return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search work orders
  workOrders.forEach(order => {
    if (
      order.id.toLowerCase().includes(normalizedQuery) ||
      order.description.toLowerCase().includes(normalizedQuery) ||
      order.customer.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        id: order.id,
        title: order.description,
        subtitle: `Work Order - ${order.customer}`,
        type: 'work-order',
        url: `/work-orders/${order.id}`
      });
    }
  });

  // Search invoices
  invoices.forEach(invoice => {
    if (
      invoice.id.toLowerCase().includes(normalizedQuery) ||
      invoice.description.toLowerCase().includes(normalizedQuery) ||
      invoice.customer.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        id: invoice.id,
        title: invoice.description,
        subtitle: `Invoice - ${invoice.customer}`,
        type: 'invoice',
        url: `/invoices/${invoice.id}`
      });
    }
  });

  // Search customers
  customers.forEach(customer => {
    if (
      customer.id.toLowerCase().includes(normalizedQuery) ||
      customer.name.toLowerCase().includes(normalizedQuery) ||
      (customer.company && customer.company.toLowerCase().includes(normalizedQuery))
    ) {
      results.push({
        id: customer.id,
        title: customer.name,
        subtitle: `Customer${customer.company ? ` - ${customer.company}` : ''}`,
        type: 'customer',
        url: `/customers/${customer.id}`
      });
    }
  });

  // Search equipment
  equipment.forEach(item => {
    if (
      item.id.toLowerCase().includes(normalizedQuery) ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.customer.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        id: item.id,
        title: item.name,
        subtitle: `Equipment - ${item.customer}`,
        type: 'equipment',
        url: `/equipment/${item.id}`
      });
    }
  });

  // Search inventory
  inventoryItems.forEach(item => {
    if (
      item.id.toLowerCase().includes(normalizedQuery) ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.sku.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        id: item.id,
        title: item.name,
        subtitle: `Inventory - ${item.sku}`,
        type: 'inventory',
        url: `/inventory/${item.id}`
      });
    }
  });

  // Limit to top 10 results
  return results.slice(0, 10);
};
