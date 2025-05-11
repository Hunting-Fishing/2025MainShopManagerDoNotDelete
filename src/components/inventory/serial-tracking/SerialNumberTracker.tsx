
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useSerialNumbers, SerialNumber } from '@/hooks/inventory/useSerialNumbers';
import { InventoryItemExtended } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

// Update the props interface to include 'item'
export interface SerialNumberTrackerProps {
  itemId: string;
}

export const SerialNumberTracker: React.FC<SerialNumberTrackerProps> = ({ itemId }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [serialStatus, setSerialStatus] = useState('in_stock');
  const [notes, setNotes] = useState('');
  
  const {
    serialNumbers,
    loading,
    addSerialNumber,
    deleteSerialNumber,
    updateSerialStatus,
    refreshSerialNumbers
  } = useSerialNumbers(itemId);
  
  const handleAddSerial = async () => {
    if (!serialNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Serial number cannot be empty',
        variant: 'destructive'
      });
      return;
    }
    
    await addSerialNumber(serialNumber, serialStatus, notes);
    setSerialNumber('');
    setNotes('');
    setShowAddDialog(false);
  };
  
  const handleDelete = async (serialId: string) => {
    if (confirm('Are you sure you want to delete this serial number?')) {
      await deleteSerialNumber(serialId);
    }
  };
  
  const handleStatusChange = async (serialId: string, newStatus: string) => {
    await updateSerialStatus(serialId, newStatus);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'sold':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'returned':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'defective':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading serial numbers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Serial Numbers</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Serial Number
        </Button>
      </div>
      
      {serialNumbers && serialNumbers.length > 0 ? (
        <div className="border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serialNumbers.map((serial) => (
                <tr key={serial.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {serial.serialNumber}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <select
                        value={serial.status}
                        onChange={(e) => handleStatusChange(serial.id, e.target.value)}
                        className="block px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="sold">Sold</option>
                        <option value="returned">Returned</option>
                        <option value="defective">Defective</option>
                      </select>
                      <Badge className={`ml-2 ${getStatusBadgeColor(serial.status)}`}>
                        {serial.status === 'in_stock' ? 'In Stock' : 
                         serial.status === 'sold' ? 'Sold' : 
                         serial.status === 'returned' ? 'Returned' : 
                         serial.status === 'defective' ? 'Defective' : 
                         serial.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(serial.addedDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">
                    {serial.notes}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(serial.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No serial numbers registered for this item</p>
        </div>
      )}
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Serial Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSerialNumber(e.target.value)}
                placeholder="Enter serial number"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={serialStatus}
                onChange={(e) => setSerialStatus(e.target.value)}
                className="block w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
                <option value="returned">Returned</option>
                <option value="defective">Defective</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this serial number"
                className="block w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSerial}>
              Add Serial Number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

