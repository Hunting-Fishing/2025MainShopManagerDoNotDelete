
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface SpecialOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: any) => void;
  suppliers: string[];
}

const specialOrderSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  sku: z.string().optional(),
  unit_price: z.coerce.number().min(0, { message: "Price must be at least 0" }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }),
  category: z.string().optional(),
  notes: z.string().optional(),
  supplierName: z.string().min(1, { message: "Please select a supplier" }),
  estimatedArrivalDate: z.date().optional(),
});

type SpecialOrderFormValues = z.infer<typeof specialOrderSchema>;

export const SpecialOrderDialog: React.FC<SpecialOrderDialogProps> = ({
  open,
  onOpenChange,
  onAddItem,
  suppliers = [],
}) => {
  const form = useForm<SpecialOrderFormValues>({
    resolver: zodResolver(specialOrderSchema),
    defaultValues: {
      name: "",
      sku: "",
      unit_price: 0,
      quantity: 1,
      category: "Special Order",
      notes: "",
      supplierName: suppliers.length > 0 ? suppliers[0] : "",
    },
  });

  const handleSubmit = (values: SpecialOrderFormValues) => {
    // Add calculated total field to match WorkOrderInventoryItem
    const specialOrderItem = {
      ...values,
      id: `special-${Date.now()}`, // Generate a temporary ID
      status: "ordered",
      itemStatus: "On Order",
      total: values.unit_price * values.quantity,
    };

    onAddItem(specialOrderItem);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Special Order Item</DialogTitle>
          <DialogDescription>
            Add a custom item that needs to be ordered from a supplier
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Custom Brake Pads" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU/Part Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional" />
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
                      <Input {...field} placeholder="Special Order" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier} value={supplier}>
                              {supplier}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimatedArrivalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Estimated Arrival</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3}
                        {...field} 
                        placeholder="Special instructions for this order" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Special Order</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
