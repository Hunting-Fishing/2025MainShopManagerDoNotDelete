
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventoryOrders } from "@/hooks/inventory/useInventoryOrders";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { format } from "date-fns";
import { CreateInventoryOrderDto } from "@/types/inventory/orders";
import { InventoryItemExtended } from "@/types/inventory";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function useCreateOrderDialog() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { addOrder } = useInventoryOrders();
  const { loadInventoryItems } = useInventoryCrud();
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInventoryOrderDto>({
    item_id: "",
    expected_arrival: "",
    quantity_ordered: 1,
    supplier: "",
    notes: "",
  });

  const openCreateOrderDialog = async () => {
    setFormData({
      item_id: "",
      expected_arrival: "",
      quantity_ordered: 1,
      supplier: "",
      notes: "",
    });
    setSelectedDate(undefined);
    
    // Load inventory items
    setLoading(true);
    try {
      const inventoryItems = await loadInventoryItems();
      setItems(inventoryItems);
    } catch (error) {
      console.error("Failed to load inventory items:", error);
    } finally {
      setLoading(false);
    }
    
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addOrder(formData);
      closeDialog();
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity_ordered" ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date?: Date) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        expected_arrival: format(date, "yyyy-MM-dd")
      }));
    }
  };

  // Find supplierName for selected item to pre-populate supplier field
  const getItemSupplier = (itemId: string) => {
    const selectedItem = items.find(item => item.id === itemId);
    return selectedItem?.supplier || "";
  };

  const CreateOrderDialog = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Create a new inventory order for items that have been ordered but not yet received.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.item_id} 
                  onValueChange={(value) => {
                    handleSelectChange("item_id", value);
                    // Auto-fill supplier if available
                    const supplierName = getItemSupplier(value);
                    if (supplierName) {
                      handleSelectChange("supplier", supplierName);
                    }
                  }}
                  disabled={loading || items.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                Supplier
              </Label>
              <div className="col-span-3">
                <Input
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="Supplier name"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3">
                <Input
                  id="quantity_ordered"
                  name="quantity_ordered"
                  type="number"
                  min="1"
                  value={formData.quantity_ordered}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expected_arrival" className="text-right">
                Expected Arrival
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Optional notes about this order"
                  disabled={loading}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.item_id || !formData.expected_arrival || !formData.supplier || formData.quantity_ordered < 1}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return {
    openCreateOrderDialog,
    CreateOrderDialog,
  };
}
