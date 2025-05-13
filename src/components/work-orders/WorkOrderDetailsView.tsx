import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { deleteWorkOrder } from "@/utils/workOrders/crud";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WorkOrderDetailsViewProps {
  id: string;
  customer: string;
  description: string;
  status: string;
  priority: string;
  technician: string;
  date: string;
  dueDate: string;
  location: string;
  notes?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  odometer?: string;
  licensePlate?: string;
  vin?: string;
}

export function WorkOrderDetailsView({
  id,
  customer,
  description,
  status,
  priority,
  technician,
  date,
  dueDate,
  location,
  notes,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  odometer,
  licensePlate,
  vin,
}: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const success = await deleteWorkOrder(id);
    if (success) {
      toast.success("Work order deleted successfully");
      navigate("/work-orders");
    } else {
      toast.error("Failed to delete work order");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-slate-800/50 rounded-lg shadow">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">{`Work Order #${id}`}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Customer:</strong> {customer}
            </div>
            <div>
              <strong>Status:</strong> {status}
            </div>
            <div>
              <strong>Priority:</strong> {priority}
            </div>
            <div>
              <strong>Technician:</strong> {technician}
            </div>
            <div>
              <strong>Date:</strong> {date}
            </div>
            <div>
              <strong>Due Date:</strong> {dueDate}
            </div>
            <div>
              <strong>Location:</strong> {location}
            </div>
            {vehicleMake && vehicleModel && vehicleYear && (
              <div>
                <strong>Vehicle:</strong> {vehicleYear} {vehicleMake} {vehicleModel}
              </div>
            )}
            {odometer && (
              <div>
                <strong>Odometer:</strong> {odometer}
              </div>
            )}
            {licensePlate && (
              <div>
                <strong>License Plate:</strong> {licensePlate}
              </div>
            )}
            {vin && (
              <div>
                <strong>VIN:</strong> {vin}
              </div>
            )}
          </div>
          <div>
            <strong>Description:</strong> {description}
          </div>
          {notes && (
            <div>
              <strong>Notes:</strong> {notes}
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={() => navigate(`/work-orders/${id}/edit`)}>
          Edit
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Are you sure absolutely sure?</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>This action cannot be undone. This will permanently delete this work order from our servers.</p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
