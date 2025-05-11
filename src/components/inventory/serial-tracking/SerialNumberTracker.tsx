
import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSerialNumbers, SerialNumber } from "@/hooks/inventory/useSerialNumbers";
import { Trash2, Plus, FileText } from "lucide-react";

interface SerialNumberTrackerProps {
  itemId: string;
}

export function SerialNumberTracker({ itemId }: SerialNumberTrackerProps) {
  const { serialNumbers, loading, addSerialNumber, deleteSerialNumber, updateSerialStatus } = useSerialNumbers(itemId);
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [status, setStatus] = useState("in_stock");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSerialNumber = async () => {
    if (!newSerialNumber.trim()) return;
    
    await addSerialNumber(newSerialNumber, status, notes);
    setNewSerialNumber("");
    setStatus("in_stock");
    setNotes("");
    setShowAddForm(false);
  };

  const handleDeleteSerialNumber = async (serialId: string) => {
    await deleteSerialNumber(serialId);
  };

  const handleStatusChange = async (serialId: string, newStatus: string) => {
    await updateSerialStatus(serialId, newStatus);
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'sold':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'defective':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Serial Number Tracking</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Serial Number
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="bg-slate-50 p-4 rounded-md border mb-4">
              <h3 className="text-sm font-medium mb-3">Add New Serial Number</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={newSerialNumber}
                    onChange={(e) => setNewSerialNumber(e.target.value)}
                    placeholder="Enter serial number"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="defective">Defective</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSerialNumber}>
                  Save Serial Number
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4">
            {loading ? (
              <div className="text-center p-4">Loading serial numbers...</div>
            ) : serialNumbers && serialNumbers.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serialNumbers.map((serial) => (
                      <TableRow key={serial.id}>
                        <TableCell className="font-medium">{serial.serialNumber}</TableCell>
                        <TableCell>
                          <Select 
                            value={serial.status} 
                            onValueChange={(value) => handleStatusChange(serial.id, value)}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(serial.status)}`}>
                                  {serial.status === 'in_stock' ? 'In Stock' : 
                                   serial.status === 'sold' ? 'Sold' :
                                   serial.status === 'defective' ? 'Defective' :
                                   serial.status === 'reserved' ? 'Reserved' : serial.status}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_stock">In Stock</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                              <SelectItem value="defective">Defective</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(serial.addedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {serial.notes ? (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-slate-400" />
                              <span className="truncate max-w-[200px]">{serial.notes}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSerialNumber(serial.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-4 bg-slate-50 border rounded-md">
                No serial numbers tracked for this item yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
