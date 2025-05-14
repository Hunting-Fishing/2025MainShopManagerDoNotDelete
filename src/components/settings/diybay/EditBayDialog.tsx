
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bay, RateSettings } from "@/services/diybay/diybayService";

interface EditBayDialogProps {
  bay: Bay | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bay: Bay) => Promise<boolean>;
  calculateRate: (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number) => number;
  settings: RateSettings;
  isSaving: boolean;
}

export const EditBayDialog: React.FC<EditBayDialogProps> = ({
  bay,
  isOpen,
  onClose,
  onSave,
  calculateRate,
  settings,
  isSaving,
}) => {
  const [editedBay, setEditedBay] = useState<Bay | null>(null);

  useEffect(() => {
    if (bay) {
      setEditedBay({ ...bay });
    } else {
      setEditedBay(null);
    }
  }, [bay]);

  const updateHourlyRate = (hourlyRate: number) => {
    if (!editedBay) return;
    
    const daily = calculateRate('daily', hourlyRate);
    const weekly = calculateRate('weekly', hourlyRate);
    const monthly = calculateRate('monthly', hourlyRate);
    
    setEditedBay({
      ...editedBay,
      hourly_rate: hourlyRate,
      daily_rate: daily,
      weekly_rate: weekly,
      monthly_rate: monthly
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedBay) return;
    
    const success = await onSave(editedBay);
    if (success) {
      onClose();
    }
  };

  // Guard against null bay
  if (!editedBay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bay?.id ? 'Edit' : 'Add'} Bay</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={editedBay.bay_name}
              onChange={(e) =>
                setEditedBay({ ...editedBay, bay_name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location (Optional)</label>
            <input
              type="text"
              value={editedBay.bay_location || ''}
              onChange={(e) =>
                setEditedBay({ ...editedBay, bay_location: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editedBay.hourly_rate}
              onChange={(e) =>
                updateHourlyRate(parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Daily Rate</label>
              <div className="text-lg font-medium">
                ${editedBay.daily_rate?.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weekly Rate</label>
              <div className="text-lg font-medium">
                ${editedBay.weekly_rate?.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Rate</label>
              <div className="text-lg font-medium">
                ${editedBay.monthly_rate?.toFixed(2)}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
