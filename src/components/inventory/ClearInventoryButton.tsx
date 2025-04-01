
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { clearAllInventoryItems } from "@/services/inventoryService";
import { toast } from "@/hooks/use-toast";

export function ClearInventoryButton({ onSuccess }: { onSuccess: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearInventory = async () => {
    try {
      setIsDeleting(true);
      await clearAllInventoryItems();
      toast({
        title: "Inventory cleared",
        description: "All inventory items have been removed",
        variant: "success"
      });
      setIsDialogOpen(false);
      // Call the success callback to refresh the inventory list
      onSuccess();
    } catch (error) {
      console.error("Error clearing inventory:", error);
      toast({
        title: "Error",
        description: "Failed to clear inventory items",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => setIsDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Clear Inventory
      </Button>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Inventory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all inventory items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleClearInventory}
              disabled={isDeleting}
            >
              {isDeleting ? "Clearing..." : "Clear All Items"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
