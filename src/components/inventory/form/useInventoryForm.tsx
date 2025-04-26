
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InventoryItemExtended } from "@/types/inventory";
import { createInventoryItem, updateInventoryItem } from "@/services/inventory/crudService";
import { toast } from "@/components/ui/use-toast";

// Form schema
const inventoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  quantity: z.number().int().min(0, "Quantity must be a positive number"),
  min_stock_level: z.number().int().min(0, "Minimum stock level must be a positive number"),
  unit_price: z.number().min(0, "Price must be a positive number"),
  location: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

const getDefaultValues = (): Omit<InventoryItemExtended, "id"> => {
  return {
    name: "",
    sku: "",
    category: "",
    supplier: "",
    quantity: 0,
    min_stock_level: 5,
    unit_price: 0,
    location: "",
    status: "In Stock",
    description: "",
    // These are for display compatibility with the form
    reorderPoint: 5,
    unitPrice: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

interface UseInventoryFormProps {
  item?: InventoryItemExtended;
  onSuccess?: () => void;
}

export function useInventoryForm({ item, onSuccess }: UseInventoryFormProps = {}) {
  const [loading, setLoading] = useState(false);

  // Initialize form with default values or provided item
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: item ? {
      name: item.name,
      sku: item.sku,
      category: item.category,
      supplier: item.supplier,
      quantity: item.quantity,
      min_stock_level: item.min_stock_level || item.reorderPoint || 5,
      unit_price: item.unit_price || item.unitPrice || 0,
      location: item.location || "",
      status: item.status || "In Stock",
      description: item.description || ""
    } : getDefaultValues()
  });

  // Form submission handler
  async function onSubmit(data: InventoryFormValues) {
    setLoading(true);
    try {
      // Map form values to inventory item format
      if (item) {
        // Update existing item
        await updateInventoryItem(item.id, {
          ...data,
          // For backward compatibility
          reorderPoint: data.min_stock_level,
          unitPrice: data.unit_price,
        });
        toast({
          title: "Inventory item updated",
          description: `${data.name} has been updated successfully.`
        });
      } else {
        // Create new item
        await createInventoryItem({
          ...data,
          // For backward compatibility
          reorderPoint: data.min_stock_level,
          unitPrice: data.unit_price,
        });
        toast({
          title: "Inventory item created",
          description: `${data.name} has been added to inventory.`
        });
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form if creating new item
      if (!item) {
        form.reset(getDefaultValues());
      }
    } catch (error) {
      console.error("Error saving inventory item:", error);
      toast({
        title: "Error",
        description: `Failed to ${item ? "update" : "create"} inventory item.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
    isEditing: !!item
  };
}
