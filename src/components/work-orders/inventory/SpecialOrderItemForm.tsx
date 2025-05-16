
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkOrderInventoryItem } from "@/types/workOrder";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  sku: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  unitPrice: z.number().min(0, { message: "Unit price must be zero or positive" }),
  notes: z.string().optional(),
  estimatedArrivalDate: z.date().optional(),
  supplierName: z.string().optional(),
  itemStatus: z.enum(["in-stock", "ordered", "backordered", "out-of-stock", "special-order"]),
  supplierOrderRef: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export interface SpecialOrderItemFormProps {
  initialData?: Partial<WorkOrderInventoryItem>;
  suppliers?: string[];
  onSubmit?: (item: Partial<WorkOrderInventoryItem>) => void;
  onAdd?: (item: Partial<WorkOrderInventoryItem>) => void;
  onCancel: () => void;
}

export function SpecialOrderItemForm({
  initialData,
  suppliers = [],
  onSubmit,
  onAdd,
  onCancel
}: SpecialOrderItemFormProps) {
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState<Date | undefined>(
    initialData?.estimatedArrivalDate ? new Date(initialData.estimatedArrivalDate) : undefined
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      category: initialData?.category || "",
      quantity: initialData?.quantity || 1,
      unitPrice: initialData?.unitPrice || 0,
      notes: initialData?.notes || "",
      supplierName: initialData?.supplierName || "",
      itemStatus: initialData?.itemStatus || "special-order",
      supplierOrderRef: initialData?.supplierOrderRef || ""
    }
  });

  const handleSubmit = (values: FormValues) => {
    const item: Partial<WorkOrderInventoryItem> = {
      ...values,
      estimatedArrivalDate: estimatedArrivalDate?.toISOString(),
      unitPrice: values.unitPrice
    };
    
    // Use the appropriate callback
    if (onSubmit) {
      onSubmit(item);
    } else if (onAdd) {
      onAdd(item);
    }
  };

  const handleSelectSupplier = (value: string) => {
    form.setValue("supplierName", value);
  };

  const handleSelectStatus = (value: string) => {
    form.setValue("itemStatus", value as "in-stock" | "ordered" | "backordered" | "out-of-stock" | "special-order");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter item name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter SKU" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter category" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value}
                    min={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Estimated Arrival Date</FormLabel>
          <DatePicker 
            date={estimatedArrivalDate} 
            onSelect={setEstimatedArrivalDate}
          />
        </div>
        
        <FormField
          control={form.control}
          name="supplierName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select
                value={field.value}
                onValueChange={handleSelectSupplier}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="itemStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                value={field.value}
                onValueChange={handleSelectStatus}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="backordered">Backordered</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="special-order">Special Order</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="supplierOrderRef"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Order Reference</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Order reference number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter any additional notes about this item"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData?.id ? "Update" : "Add"} Item
          </Button>
        </div>
      </form>
    </Form>
  );
}
