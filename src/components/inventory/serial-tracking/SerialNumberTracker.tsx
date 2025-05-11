
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { InventoryItemExtended } from '@/types/inventory';
import { useSerialNumbers } from '@/hooks/inventory/useSerialNumbers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SerialNumberTrackerProps {
  item: InventoryItemExtended;
}

export function SerialNumberTracker({ item }: SerialNumberTrackerProps) {
  const { 
    serialNumbers, 
    addSerialNumber, 
    deleteSerialNumber, 
    updateSerialStatus, 
    loading 
  } = useSerialNumbers(item.id);
  
  const [newSerial, setNewSerial] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [bulkSerials, setBulkSerials] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('in_stock');

  const handleAddSerial = async () => {
    if (!newSerial.trim()) return;
    await addSerialNumber(newSerial, selectedStatus, notes);
    setNewSerial('');
    setNotes('');
  };

  const handleBulkAdd = async () => {
    if (!bulkSerials.trim()) return;
    
    // Split by newlines, commas, or spaces
    const serials = bulkSerials.split(/[\n,\s]+/).filter(s => s.trim());
    
    // Add each serial number
    for (const serial of serials) {
      if (serial.trim()) {
        await addSerialNumber(serial.trim(), selectedStatus, notes);
      }
    }
    
    setBulkSerials('');
    setNotes('');
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Serial Number Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="newSerial">Add Serial Number</Label>
              <div className="flex mt-1">
                <Input
                  id="newSerial"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  placeholder="Enter serial number"
                  className="rounded-r-none"
                />
                <Button 
                  onClick={handleAddSerial} 
                  disabled={loading || !newSerial.trim()}
                  className="rounded-l-none"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
            <div className="md:self-end">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                Bulk Add
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Serial Numbers ({serialNumbers?.length || 0})</h3>
            {serialNumbers && serialNumbers.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Added Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serialNumbers.map((serial) => (
                      <TableRow key={serial.id}>
                        <TableCell className="font-medium">{serial.serialNumber}</TableCell>
                        <TableCell>
                          <Select
                            defaultValue={serial.status}
                            onValueChange={(value) => updateSerialStatus(serial.id, value)}
                            disabled={loading}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_stock">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                  In Stock
                                </div>
                              </SelectItem>
                              <SelectItem value="sold">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                  Sold
                                </div>
                              </SelectItem>
                              <SelectItem value="reserved">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                  Reserved
                                </div>
                              </SelectItem>
                              <SelectItem value="defective">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                  Defective
                                </div>
                              </SelectItem>
                              <SelectItem value="returned">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                  Returned
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{serial.notes || '-'}</TableCell>
                        <TableCell>{new Date(serial.addedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteSerialNumber(serial.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-4 bg-slate-50 border rounded-md">
                No serial numbers tracked for this item
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#9B5C13" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Serial Number Tracking</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Serial numbers help track individual units through your inventory system. Use this feature for warranty claims, recalls, and to match specific units to customers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Add Serial Numbers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="bulkSerials" className="text-right">
                Serial Numbers
              </Label>
              <div className="mt-1">
                <Input 
                  id="bulkSerials" 
                  value={bulkSerials} 
                  onChange={(e) => setBulkSerials(e.target.value)} 
                  placeholder="Enter serial numbers separated by commas, spaces, or new lines"
                  className="h-20"
                  as="textarea"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="serialStatus" className="text-right">
                Status
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="serialStatus" className="w-full mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="defective">Defective</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes" className="text-right">
                Notes (Optional)
              </Label>
              <div className="mt-1">
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for these serial numbers"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAdd} 
              disabled={loading || !bulkSerials.trim()}
            >
              Add Serial Numbers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
