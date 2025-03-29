
// Define the inventory item interface with extended properties
export interface InventoryItemExtended {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  reorderPoint: number;
  unitPrice: number;
  location: string;
  status: string;
  description?: string; // Making description optional
}

// Mock data for inventory items
export const inventoryItems: InventoryItemExtended[] = [
  {
    id: "INV-1001",
    name: "HVAC Filter - Premium",
    sku: "HVF-P-100",
    category: "HVAC",
    supplier: "TechSupplies Inc.",
    quantity: 45,
    reorderPoint: 15,
    unitPrice: 24.99,
    location: "Warehouse A - Section 3",
    status: "In Stock",
    description: "High-quality HVAC filter for commercial applications"
  },
  {
    id: "INV-1002",
    name: "Copper Pipe - 3/4\" x 10'",
    sku: "CP-34-10",
    category: "Plumbing",
    supplier: "PlumbPro Distributors",
    quantity: 120,
    reorderPoint: 30,
    unitPrice: 18.75,
    location: "Warehouse B - Section 1",
    status: "In Stock",
    description: "Standard copper pipe for plumbing installations"
  },
  {
    id: "INV-1003",
    name: "Circuit Breaker - 30 Amp",
    sku: "CB-30A",
    category: "Electrical",
    supplier: "ElectroSupply Co.",
    quantity: 35,
    reorderPoint: 20,
    unitPrice: 42.50,
    location: "Warehouse A - Section 7",
    status: "In Stock",
    description: "30 Amp circuit breaker for electrical panels"
  },
  {
    id: "INV-1004",
    name: "Door Lock Set - Commercial Grade",
    sku: "DL-CG-100",
    category: "Security",
    supplier: "SecureTech Systems",
    quantity: 12,
    reorderPoint: 15,
    unitPrice: 89.99,
    location: "Warehouse A - Section 5",
    status: "Low Stock",
    description: "Commercial grade door lock set with master key capability"
  },
  {
    id: "INV-1005",
    name: "Water Heater Element - 4500W",
    sku: "WHE-4500",
    category: "Plumbing",
    supplier: "PlumbPro Distributors",
    quantity: 0,
    reorderPoint: 10,
    unitPrice: 32.99,
    location: "Warehouse B - Section 3",
    status: "Out of Stock",
    description: "Replacement heating element for water heaters"
  },
  {
    id: "INV-1006",
    name: "LED Light Panel - 2x4 ft",
    sku: "LED-P-24",
    category: "Electrical",
    supplier: "ElectroSupply Co.",
    quantity: 28,
    reorderPoint: 10,
    unitPrice: 79.95,
    location: "Warehouse A - Section 9",
    status: "In Stock",
    description: "Energy-efficient LED panel light for commercial spaces"
  },
];

// Export the same data with a different name for backward compatibility
export const mockInventoryItems = inventoryItems;
