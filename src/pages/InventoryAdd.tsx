
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { InventoryItemExtended } from "@/types/inventory";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields differently
    if (name === "quantity" || name === "reorderPoint" || name === "unitPrice") {
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.sku || !formData.category || !formData.supplier) {
      return;
    }

    try {
      await createItem(formData);
      navigate("/inventory");
    } catch (error) {
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
          />
          
          <FormField
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            placeholder="Enter SKU"
          />
          
          <FormField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Enter category"
          />
          
          <FormField
            label="Supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required
            placeholder="Enter supplier"
          />
          
          <FormField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity.toString()}
            onChange={handleChange}
            required
            min="0"
          />
          
          <FormField
            label="Reorder Point"
            name="reorderPoint"
            type="number"
            value={formData.reorderPoint.toString()}
            onChange={handleChange}
            required
            min="0"
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
