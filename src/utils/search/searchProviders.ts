
import { workOrders } from "@/data/workOrdersData";
import { invoices } from "@/data/invoiceData";
import { customers } from "@/data/customersData";
import { equipment } from "@/data/equipmentData";
import { inventoryItems } from "@/data/mockInventoryData";
import { findMatches } from "./relevanceUtils";
import { SearchResult, SearchResultType } from "./types";

// Search work orders
export const searchWorkOrders = (query: string): SearchResult[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  workOrders.forEach(order => {
    let relevance = 0;
    
    // Check different fields with different weights
    relevance = Math.max(
      relevance,
      findMatches(order.id, normalizedQuery),
      findMatches(order.description, normalizedQuery) * 0.9,
      findMatches(order.customer, normalizedQuery) * 0.8,
      findMatches(order.location, normalizedQuery) * 0.7,
      findMatches(order.technician, normalizedQuery) * 0.7
    );
    
    if (relevance > 0) {
      results.push({
        id: order.id,
        title: order.description,
        subtitle: `Work Order - ${order.customer}`,
        type: 'work-order',
        url: `/work-orders/${order.id}`,
        relevance
      });
    }
  });

  return results;
};

// Search invoices
export const searchInvoices = (query: string): SearchResult[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  invoices.forEach(invoice => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(invoice.id, normalizedQuery),
      findMatches(invoice.description, normalizedQuery) * 0.9,
      findMatches(invoice.customer, normalizedQuery) * 0.8
    );
    
    if (relevance > 0) {
      results.push({
        id: invoice.id,
        title: invoice.description,
        subtitle: `Invoice - ${invoice.customer}`,
        type: 'invoice',
        url: `/invoices/${invoice.id}`,
        relevance
      });
    }
  });

  return results;
};

// Search customers
export const searchCustomers = (query: string): SearchResult[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  customers.forEach(customer => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(customer.id, normalizedQuery),
      findMatches(customer.name, normalizedQuery),
      customer.company ? findMatches(customer.company, normalizedQuery) * 0.9 : 0,
      customer.email ? findMatches(customer.email, normalizedQuery) * 0.8 : 0,
      customer.phone ? findMatches(customer.phone, normalizedQuery) * 0.7 : 0
    );
    
    if (relevance > 0) {
      results.push({
        id: customer.id,
        title: customer.name,
        subtitle: `Customer${customer.company ? ` - ${customer.company}` : ''}`,
        type: 'customer',
        url: `/customers/${customer.id}`,
        relevance
      });
    }
  });

  return results;
};

// Search equipment
export const searchEquipment = (query: string): SearchResult[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  equipment.forEach(item => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(item.id, normalizedQuery),
      findMatches(item.name, normalizedQuery),
      findMatches(item.model, normalizedQuery) * 0.9,
      findMatches(item.serialNumber, normalizedQuery) * 0.9,
      findMatches(item.customer, normalizedQuery) * 0.8,
      findMatches(item.manufacturer, normalizedQuery) * 0.7
    );
    
    if (relevance > 0) {
      results.push({
        id: item.id,
        title: item.name,
        subtitle: `Equipment - ${item.customer}`,
        type: 'equipment',
        url: `/equipment/${item.id}`,
        relevance
      });
    }
  });

  return results;
};

// Search inventory
export const searchInventory = (query: string): SearchResult[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  inventoryItems.forEach(item => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(item.id, normalizedQuery),
      findMatches(item.name, normalizedQuery),
      findMatches(item.sku, normalizedQuery) * 0.9,
      findMatches(item.description || '', normalizedQuery) * 0.8,  // Handle optional description
      findMatches(item.category, normalizedQuery) * 0.7
    );
    
    if (relevance > 0) {
      results.push({
        id: item.id,
        title: item.name,
        subtitle: `Inventory - ${item.sku}`,
        type: 'inventory',
        url: `/inventory/${item.id}`,
        relevance
      });
    }
  });

  return results;
};
