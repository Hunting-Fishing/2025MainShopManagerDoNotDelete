
import { useState } from 'react';
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { useInventoryOrders } from "@/hooks/inventory/useInventoryOrders";
import { CreateInventoryOrderDto } from "@/types/inventory/orders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemExtended } from "@/types/inventory";
import { useState as createState } from "react";

export function useCreateOrderDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { loadInventoryItems } = useInventoryCrud();
  const { createOrder } = useInventoryOrders();
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateInventoryOrderDto>>({
    expected_arrival: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    quantity_ordered: 1
  });
  
  const openCreateOrderDialog = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const items = await loadInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const closeCreateOrderDialog = () => {
    setIsOpen(false);
    setFormData({
      expected_arrival: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      quantity_ordered: 1
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date?: Date) => {
    if (date) {
      setFormData(prev => ({ 
        ...prev, 
        expected_arrival: format(date, 'yyyy-MM-dd') 
      }));
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_id || !formData.quantity_ordered || !formData.supplier || !formData.expected_arrival) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createOrder(formData as CreateInventoryOrderDto);
      closeCreateOrderDialog();
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setLoading(false);
    }
  };

  const CreateOrderDialog = () => {
    const [date, setDate] = createState<Date | undefined>(
      formData.expected_arrival ? new Date(formData.expected_arrival) : undefined
    );

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item_id">Inventory Item</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('item_id', value)}
                disabled={loading || inventoryItems.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_ordered">Quantity</Label>
              <Input 
                id="quantity_ordered" 
                name="quantity_ordered" 
                type="number" 
                min="1"
                placeholder="Quantity" 
                value={formData.quantity_ordered || ""}
                onChange={handleNumberChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input 
                id="supplier" 
                name="supplier" 
                placeholder="Supplier name" 
                value={formData.supplier || ""}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_arrival">Expected Arrival</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      handleDateChange(date);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Additional notes" 
                value={formData.notes || ""}
                onChange={handleTextAreaChange}
                disabled={loading}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateOrderDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return {
    openCreateOrderDialog,
    closeCreateOrderDialog,
    CreateOrderDialog
  };
}
