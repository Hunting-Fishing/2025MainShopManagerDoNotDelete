
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInventoryItems } from '@/services/inventoryService';
import { toast } from '@/components/ui/use-toast';

interface InventoryQuantityManagerProps {
  itemId: string;
  initialQuantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

export function InventoryQuantityManager({ 
  itemId, 
  initialQuantity, 
  onQuantityChange 
}: InventoryQuantityManagerProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [maxAvailable, setMaxAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getItemDetails = async () => {
      try {
        setLoading(true);
        const inventoryItems = await getInventoryItems();
        const item = inventoryItems.find(item => item.id === itemId);
        
        if (item) {
          setMaxAvailable(item.quantity || 0);
        }
      } catch (error) {
        console.error("Error fetching inventory details:", error);
        toast({
          title: "Error",
          description: "Could not fetch inventory information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    getItemDetails();
  }, [itemId]);
  
  const handleIncrement = () => {
    if (quantity < maxAvailable) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    } else {
      toast({
        title: "Maximum reached",
        description: `Only ${maxAvailable} available in inventory`,
      });
    }
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
      onQuantityChange(1);
    } else if (value > maxAvailable) {
      setQuantity(maxAvailable);
      onQuantityChange(maxAvailable);
      toast({
        title: "Maximum reached",
        description: `Only ${maxAvailable} available in inventory`,
      });
    } else {
      setQuantity(value);
      onQuantityChange(value);
    }
  };
  
  return (
    <div className="flex items-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDecrement}
        disabled={quantity <= 1 || loading}
      >
        -
      </Button>
      <Input
        className="w-16 mx-1 text-center"
        value={quantity}
        onChange={handleInputChange}
        disabled={loading}
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleIncrement}
        disabled={quantity >= maxAvailable || loading}
      >
        +
      </Button>
    </div>
  );
}
