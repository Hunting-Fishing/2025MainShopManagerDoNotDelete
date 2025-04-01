
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { InventoryItemExtended } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";
import { getInventoryStatus } from "@/services/inventory/utils";

export default function InventoryAdd() {
  const navigate = useNavigate();
  const { createItem, loading } = useInventoryCrud();
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
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.sku.trim()) errors.sku = "SKU is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.supplier.trim()) errors.supplier = "Supplier is required";
    
    if (formData.unitPrice < 0) errors.unitPrice = "Price cannot be negative";
    if (formData.quantity < 0) errors.quantity = "Quantity cannot be negative";
    if (formData.reorderPoint < 0) errors.reorderPoint = "Reorder point cannot be negative";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors"
      });
      return;
    }

    try {
      await createItem(formData);
      toast({
        variant: "success",
        title: "Success",
        description: `${formData.name} has been added to inventory`
      });
      navigate("/inventory");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add inventory item"
      });
      console.error("Error creating inventory item:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add Inventory Item</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/inventory")}
        >
          Cancel
        </Button>
      </div>
      
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
          
          <FormField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Enter category"
            error={formErrors.category}
          />
          
          <FormField
            label="Supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required
            placeholder="Enter supplier"
            error={formErrors.supplier}
          />
          
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
            onClick={() => navigate("/inventory")}
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
    </div>
  );
}
