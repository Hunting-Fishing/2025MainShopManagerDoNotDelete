
import { useState, useEffect } from "react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { InventoryItemExtended } from "@/types/inventory";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useInventoryFormValidation } from "@/hooks/inventory/useInventoryFormValidation";
import { getInventoryStatus } from "@/services/inventory/utils";
import { getInventoryCategories } from "@/services/inventory/categoryService";
import { getInventorySuppliers } from "@/services/inventory/supplierService";

interface InventoryFormProps {
  onSubmit: (data: Omit<InventoryItemExtended, "id">) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

export function InventoryForm({ onSubmit, loading, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState<Omit<InventoryItemExtended, "id">>({
    name: "",
    sku: "",
    category: "",
    supplier: "",
    quantity: 0,
    reorderPoint: 5,
    unitPrice: 0,
    location: "",
    status: "In Stock",
    description: ""
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const { formErrors, validateForm, clearError } = useInventoryFormValidation();

  // Load categories and suppliers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories from the service
        const categories = await getInventoryCategories();
        setCategories(categories);
        
        // Load suppliers from the service
        const suppliers = await getInventorySuppliers();
        setSuppliers(suppliers);
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };
    
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields differently
    if (name === "quantity" || name === "reorderPoint" || name === "unitPrice") {
      const numValue = value === "" ? 0 : Number(value);
      
      // Update status if quantity or reorderPoint changes
      if (name === "quantity" || name === "reorderPoint") {
        const newQuantity = name === "quantity" ? numValue : formData.quantity;
        const newReorderPoint = name === "reorderPoint" ? numValue : formData.reorderPoint;
        
        setFormData({
          ...formData,
          [name]: numValue,
          status: getInventoryStatus(newQuantity, newReorderPoint)
        });
      } else {
        setFormData({
          ...formData,
          [name]: numValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if it exists
    clearError(name);
  };
  
  // Handle select change for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    clearError(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(formData)) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter item name"
          error={formErrors.name}
        />
        
        <FormField
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
          placeholder="Enter SKU"
          error={formErrors.sku}
        />
        
        {/* Category dropdown field */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="category" className="flex items-center text-sm font-medium">
            Category<span className="text-destructive ml-1">*</span>
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger id="category" className={formErrors.category ? "border-destructive" : ""}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.category && (
            <p className="text-xs font-medium text-destructive">{formErrors.category}</p>
          )}
        </div>
        
        {/* Supplier dropdown field */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="supplier" className="flex items-center text-sm font-medium">
            Supplier<span className="text-destructive ml-1">*</span>
          </label>
          <Select
            value={formData.supplier}
            onValueChange={(value) => handleSelectChange("supplier", value)}
          >
            <SelectTrigger id="supplier" className={formErrors.supplier ? "border-destructive" : ""}>
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.supplier && (
            <p className="text-xs font-medium text-destructive">{formErrors.supplier}</p>
          )}
        </div>
        
        <FormField
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity.toString()}
          onChange={handleChange}
          required
          min="0"
          error={formErrors.quantity}
        />
        
        <FormField
          label="Reorder Point"
          name="reorderPoint"
          type="number"
          value={formData.reorderPoint.toString()}
          onChange={handleChange}
          required
          min="0"
          error={formErrors.reorderPoint}
          description="Inventory status will be set to 'Low Stock' when quantity falls below this value"
        />
        
        <FormField
          label="Unit Price"
          name="unitPrice"
          type="number"
          value={formData.unitPrice.toString()}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          error={formErrors.unitPrice}
        />
        
        <FormField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter storage location"
        />
      </div>
      
      <FormField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter item description"
      />
      
      <div className="mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-sm font-medium text-gray-700">Item Status: <span className={`font-semibold ${formData.status === 'In Stock' ? 'text-green-600' : formData.status === 'Low Stock' ? 'text-amber-600' : 'text-red-600'}`}>{formData.status}</span></div>
        <p className="text-xs text-gray-500 mt-1">Status is automatically calculated based on quantity and reorder point</p>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Item"}
        </Button>
      </div>
    </form>
  );
}
