
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash, Save, X, Table as TableIcon, Cards } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Bay } from '@/services/diybay/diybayService';

export const DIYBayRatesTab = () => {
  const { bays, isLoading, addBay, saveBay, removeBay, loadData } = useDIYBayRates();
  const { toast } = useToast();

  const [isAddingBay, setIsAddingBay] = useState(false);
  const [newBayName, setNewBayName] = useState('');
  const [editedBays, setEditedBays] = useState<Record<string, Bay>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bayToDelete, setBayToDelete] = useState<Bay | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    // Initialize edited bays with the current bays data
    const initialEditedBays: Record<string, Bay> = {};
    bays.forEach(bay => {
      initialEditedBays[bay.id] = { ...bay };
    });
    setEditedBays(initialEditedBays);
  }, [bays]);

  const handleAddBay = async () => {
    if (!newBayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a bay name.",
        variant: "destructive",
      });
      return;
    }

    const result = await addBay(newBayName);
    if (result) {
      setNewBayName('');
      setIsAddingBay(false);
      
      toast({
        title: "Success",
        description: "New bay added successfully.",
      });
    }
  };

  const handleCancel = () => {
    setNewBayName('');
    setIsAddingBay(false);
  };

  const handleEditField = (bayId: string, field: keyof Bay, value: any) => {
    setEditedBays(prev => ({
      ...prev,
      [bayId]: {
        ...prev[bayId],
        [field]: value
      }
    }));
  };

  const handleSaveBay = async (bayId: string) => {
    const bayToSave = editedBays[bayId];
    
    // Validate hourly rate (must be a number and greater than 0)
    const hourlyRate = Number(bayToSave.hourly_rate);
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      toast({
        title: "Error",
        description: "Hourly rate must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await saveBay(bayToSave);
    if (success) {
      toast({
        title: "Success",
        description: `${bayToSave.bay_name} has been updated.`,
      });
    }
  };

  const confirmDelete = (bay: Bay) => {
    setBayToDelete(bay);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteBay = async () => {
    if (!bayToDelete) return;
    
    const success = await removeBay(bayToDelete.id, bayToDelete.bay_name);
    if (success) {
      setIsDeleteDialogOpen(false);
      setBayToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setBayToDelete(null);
  };

  const handleToggleStatus = async (bay: Bay) => {
    // Create a new bay object with the toggled status
    const updatedBay = {
      ...editedBays[bay.id],
      is_active: !editedBays[bay.id].is_active
    };
    
    // Update the edited bay
    setEditedBays(prev => ({
      ...prev,
      [bay.id]: updatedBay
    }));
    
    // Save the updated bay
    await saveBay(updatedBay);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bay Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead className="text-right">Daily Rate</TableHead>
            <TableHead className="text-right">Weekly Rate</TableHead>
            <TableHead className="text-right">Monthly Rate</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No bays found. Add one to get started.
              </TableCell>
            </TableRow>
          ) : (
            bays.map((bay) => (
              <TableRow key={bay.id}>
                <TableCell>
                  <Input 
                    value={editedBays[bay.id]?.bay_name || bay.bay_name}
                    onChange={(e) => handleEditField(bay.id, 'bay_name', e.target.value)}
                    className="w-full max-w-[150px]"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={editedBays[bay.id]?.bay_location || bay.bay_location}
                    onChange={(e) => handleEditField(bay.id, 'bay_location', e.target.value)}
                    className="w-full max-w-[150px]"
                    placeholder="Location (optional)"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input 
                      value={editedBays[bay.id]?.hourly_rate || bay.hourly_rate}
                      onChange={(e) => handleEditField(bay.id, 'hourly_rate', e.target.value)}
                      type="number"
                      className="w-20 text-right"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input 
                      value={editedBays[bay.id]?.daily_rate || bay.daily_rate || 0}
                      readOnly
                      className="w-20 text-right bg-gray-50"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input 
                      value={editedBays[bay.id]?.weekly_rate || bay.weekly_rate || 0}
                      readOnly
                      className="w-20 text-right bg-gray-50"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input 
                      value={editedBays[bay.id]?.monthly_rate || bay.monthly_rate || 0}
                      readOnly
                      className="w-20 text-right bg-gray-50"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Switch 
                    checked={editedBays[bay.id]?.is_active || bay.is_active}
                    onCheckedChange={() => handleToggleStatus(bay)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSaveBay(bay.id)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700" 
                      onClick={() => confirmDelete(bay)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bays.length === 0 ? (
        <div className="col-span-full text-center p-8 border rounded-md">
          No bays found. Add one to get started.
        </div>
      ) : (
        bays.map((bay) => (
          <Card key={bay.id} className="overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <Input 
                value={editedBays[bay.id]?.bay_name || bay.bay_name}
                onChange={(e) => handleEditField(bay.id, 'bay_name', e.target.value)}
                className="w-full max-w-[200px]"
              />
              <Switch 
                checked={editedBays[bay.id]?.is_active || bay.is_active}
                onCheckedChange={() => handleToggleStatus(bay)}
              />
            </div>
            <CardContent className="pt-4 pb-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    value={editedBays[bay.id]?.bay_location || bay.bay_location}
                    onChange={(e) => handleEditField(bay.id, 'bay_location', e.target.value)}
                    placeholder="Location (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hourly Rate ($)</label>
                    <Input 
                      value={editedBays[bay.id]?.hourly_rate || bay.hourly_rate}
                      onChange={(e) => handleEditField(bay.id, 'hourly_rate', e.target.value)}
                      type="number"
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Daily Rate ($)</label>
                    <Input 
                      value={editedBays[bay.id]?.daily_rate || bay.daily_rate || 0}
                      readOnly
                      className="bg-gray-50 text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weekly Rate ($)</label>
                    <Input 
                      value={editedBays[bay.id]?.weekly_rate || bay.weekly_rate || 0}
                      readOnly
                      className="bg-gray-50 text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Rate ($)</label>
                    <Input 
                      value={editedBays[bay.id]?.monthly_rate || bay.monthly_rate || 0}
                      readOnly
                      className="bg-gray-50 text-right"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSaveBay(bay.id)}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:text-red-700" 
                onClick={() => confirmDelete(bay)}
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">DIY Bay Rates</h2>
          <p className="text-muted-foreground">Manage rates for DIY bay rentals</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <Toggle
              pressed={viewMode === 'table'}
              onPressedChange={() => setViewMode('table')}
              className="data-[state=on]:bg-white data-[state=on]:shadow-sm h-8 px-3"
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Toggle>
            <Toggle
              pressed={viewMode === 'cards'}
              onPressedChange={() => setViewMode('cards')}
              className="data-[state=on]:bg-white data-[state=on]:shadow-sm h-8 px-3"
            >
              <Cards className="h-4 w-4 mr-1" />
              Cards
            </Toggle>
          </div>

          <Button onClick={() => setIsAddingBay(true)}>Add Bay</Button>
        </div>
      </div>

      {viewMode === 'table' ? renderTableView() : renderCardView()}

      {/* Add Bay Dialog */}
      <Dialog open={isAddingBay} onOpenChange={setIsAddingBay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bay</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Enter bay name" 
              value={newBayName} 
              onChange={(e) => setNewBayName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddBay}>
              Add Bay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bay</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete {bayToDelete?.bay_name}?</p>
            <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBay}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
