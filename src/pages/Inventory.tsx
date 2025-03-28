
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart2, 
  ChevronDown, 
  Download, 
  Filter, 
  Package, 
  Plus, 
  RefreshCw, 
  Search, 
  SlidersHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for inventory items
const inventoryItems = [
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
  },
];

// Status map for styling
const statusMap = {
  "In Stock": { color: "bg-green-100 text-green-800" },
  "Low Stock": { color: "bg-yellow-100 text-yellow-800" },
  "Out of Stock": { color: "bg-red-100 text-red-800" },
};

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<string>("");

  // Get unique categories and suppliers for filters
  const categories = Array.from(new Set(inventoryItems.map(item => item.category))).sort();
  const suppliers = Array.from(new Set(inventoryItems.map(item => item.supplier))).sort();
  const statuses = Array.from(new Set(inventoryItems.map(item => item.status))).sort();

  // Filter inventory items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = 
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter.length === 0 || categoryFilter.includes(item.category);
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(item.status);
    
    const matchesSupplier = 
      !supplierFilter || item.supplier === supplierFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your parts, materials, and supplies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Inventory Report
          </Button>
          <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to="/inventory/new">
              <Plus className="h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Category
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={categoryFilter.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCategoryFilter([...categoryFilter, category]);
                    } else {
                      setCategoryFilter(categoryFilter.filter((c) => c !== category));
                    }
                  }}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, status]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== status));
                    }
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={supplierFilter}
            onValueChange={setSupplierFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2" onClick={() => {
            setSearchQuery("");
            setCategoryFilter([]);
            setStatusFilter([]);
            setSupplierFilter("");
          }}>
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Inventory Items table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Item Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                SKU
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Supplier
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[item.status as keyof typeof statusMap].color}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.supplier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/inventory/${item.id}`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                    View
                  </Link>
                  <Link to={`/inventory/${item.id}/edit`} className="text-esm-blue-600 hover:text-esm-blue-800">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
