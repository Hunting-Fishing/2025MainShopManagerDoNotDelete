
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "@/types/workOrder";

interface WorkOrderDialogProps {
  open: boolean;
  onClose: () => void;
  workOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
}

export function WorkOrderDialog({
  open,
  onClose,
  workOrders,
  onSelectWorkOrder,
}: WorkOrderDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);

  const handleSelect = () => {
    const workOrder = workOrders.find(wo => wo.id === selectedWorkOrder);
    if (workOrder) {
      onSelectWorkOrder(workOrder);
      onClose();
    }
  };

  // Filter work orders by search term
  const filteredWorkOrders = searchTerm
    ? workOrders.filter(
        (wo) =>
          wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (wo.description && wo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : workOrders;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Work Order</DialogTitle>
        </DialogHeader>

        <input
          type="text"
          placeholder="Search work orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.map((workOrder) => (
                <TableRow
                  key={workOrder.id}
                  className={selectedWorkOrder === workOrder.id ? "bg-muted" : ""}
                  onClick={() => setSelectedWorkOrder(workOrder.id)}
                >
                  <TableCell className="p-2">
                    <input
                      type="radio"
                      name="workOrderSelect"
                      checked={selectedWorkOrder === workOrder.id}
                      onChange={() => setSelectedWorkOrder(workOrder.id)}
                    />
                  </TableCell>
                  <TableCell>{workOrder.id}</TableCell>
                  <TableCell>{workOrder.description}</TableCell>
                  <TableCell>{formatDate(workOrder.createdAt)}</TableCell>
                  <TableCell>{workOrder.dueDate ? formatDate(workOrder.dueDate) : '-'}</TableCell>
                  <TableCell>{workOrder.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedWorkOrder}>
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
