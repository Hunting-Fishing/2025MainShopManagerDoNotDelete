
import React, { useState, useEffect, useMemo } from "react";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Table, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DIYBayRatesTab = () => {
  const { 
    bays, 
    settings, 
    isLoading, 
    isSaving, 
    loadData, 
    addBay, 
    saveBay, 
    removeBay, 
    calculateRate, 
    loadRateHistory, 
    rateHistory 
  } = useDIYBayRates();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bayToDelete, setBayToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editedBays, setEditedBays] = useState<Record<string, any>>({});
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);
  const [newBayName, setNewBayName] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset edited bays when original bays data changes
  useEffect(() => {
    if (bays.length > 0) {
      const initialEditState: Record<string, any> = {};
      bays.forEach(bay => {
        initialEditState[bay.id] = {
          hourly_rate: bay.hourly_rate,
          bay_name: bay.bay_name,
          is_active: bay.is_active
        };
      });
      setEditedBays(initialEditState);
    }
  }, [bays]);

  const handleAddBay = async () => {
    if (newBayName.trim()) {
      await addBay(newBayName);
      setNewBayName("");
      setAddDialogOpen(false);
    }
  };

  const handleDeleteBay = (id: string, name: string) => {
    setBayToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bayToDelete) {
      await removeBay(bayToDelete.id, bayToDelete.name);
      setDeleteDialogOpen(false);
      setBayToDelete(null);
    }
  };

  const handleRateChange = (bayId: string, field: string, value: any) => {
    setEditedBays(prev => ({
      ...prev,
      [bayId]: {
        ...prev[bayId],
        [field]: value
      }
    }));
  };

  const handleSaveBay = async (bayId: string) => {
    const editedBay = editedBays[bayId];
    const originalBay = bays.find(b => b.id === bayId);
    
    if (!originalBay || !editedBay) return;
    
    // Calculate rates based on the edited hourly rate
    const hourlyRate = parseFloat(editedBay.hourly_rate);
    const dailyRate = calculateRate('daily', hourlyRate);
    const weeklyRate = calculateRate('weekly', hourlyRate);
    const monthlyRate = calculateRate('monthly', hourlyRate);
    
    const updatedBay = {
      ...originalBay,
      hourly_rate: hourlyRate,
      daily_rate: dailyRate,
      weekly_rate: weeklyRate,
      monthly_rate: monthlyRate,
      bay_name: editedBay.bay_name,
      is_active: editedBay.is_active,
    };
    
    await saveBay(updatedBay);
  };

  const toggleStatus = async (bayId: string) => {
    const editedBay = editedBays[bayId];
    const newStatus = !editedBay.is_active;
    
    handleRateChange(bayId, 'is_active', newStatus);
    
    // Save the bay with updated status
    await handleSaveBay(bayId);
  };

  const showRateHistory = async (bayId: string) => {
    setSelectedBayId(bayId);
    await loadRateHistory(bayId);
    setHistoryDialogOpen(true);
  };

  const selectedBay = useMemo(() => {
    if (!selectedBayId) return null;
    return bays.find(bay => bay.id === selectedBayId);
  }, [selectedBayId, bays]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-36 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-2 mx-auto"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">DIY Bay Rates</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-muted/20 rounded-md p-1">
            <button
              className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewMode("table")}
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              className={`p-1.5 rounded-md ${viewMode === "cards" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewMode("cards")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            Add New Bay
          </Button>
        </div>
      </div>

      {bays.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No DIY bays configured yet</p>
          <Button onClick={() => setAddDialogOpen(true)}>Add Your First Bay</Button>
        </div>
      ) : viewMode === "table" ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Bay Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Hourly Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Daily Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Weekly Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Monthly Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bays.map((bay) => (
                <tr key={bay.id} className="bg-card">
                  <td className="px-4 py-3">
                    <Input
                      value={editedBays[bay.id]?.bay_name || bay.bay_name}
                      onChange={(e) => handleRateChange(bay.id, 'bay_name', e.target.value)}
                      onBlur={() => handleSaveBay(bay.id)}
                      className="h-8 w-full"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={editedBays[bay.id]?.hourly_rate || bay.hourly_rate}
                      onChange={(e) => handleRateChange(bay.id, 'hourly_rate', e.target.value)}
                      onBlur={() => handleSaveBay(bay.id)}
                      className="h-8 w-24"
                      min="0"
                      step="5"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(bay.daily_rate)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(bay.weekly_rate)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(bay.monthly_rate)}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={editedBays[bay.id]?.is_active ?? bay.is_active}
                      onCheckedChange={() => toggleStatus(bay.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showRateHistory(bay.id)}
                      >
                        History
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBay(bay.id, bay.bay_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bays.map((bay) => (
            <Card key={bay.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Input
                      value={editedBays[bay.id]?.bay_name || bay.bay_name}
                      onChange={(e) => handleRateChange(bay.id, 'bay_name', e.target.value)}
                      onBlur={() => handleSaveBay(bay.id)}
                      className="font-semibold text-lg"
                    />
                    <CardDescription>
                      Bay ID: {bay.id.substring(0, 8)}...
                    </CardDescription>
                  </div>
                  <Badge variant={editedBays[bay.id]?.is_active ?? bay.is_active ? "default" : "outline"}>
                    {editedBays[bay.id]?.is_active ?? bay.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`hourly-${bay.id}`}>Hourly Rate</Label>
                    <div className="flex items-center mt-1">
                      <span className="text-muted-foreground mr-1">$</span>
                      <Input
                        id={`hourly-${bay.id}`}
                        type="number"
                        value={editedBays[bay.id]?.hourly_rate || bay.hourly_rate}
                        onChange={(e) => handleRateChange(bay.id, 'hourly_rate', e.target.value)}
                        onBlur={() => handleSaveBay(bay.id)}
                        className="h-8"
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Daily Rate</Label>
                    <div className="h-8 flex items-center mt-1 text-sm font-medium">
                      {formatCurrency(bay.daily_rate)}
                    </div>
                  </div>
                  <div>
                    <Label>Weekly Rate</Label>
                    <div className="h-8 flex items-center mt-1 text-sm font-medium">
                      {formatCurrency(bay.weekly_rate)}
                    </div>
                  </div>
                  <div>
                    <Label>Monthly Rate</Label>
                    <div className="h-8 flex items-center mt-1 text-sm font-medium">
                      {formatCurrency(bay.monthly_rate)}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`status-${bay.id}`}>Status:</Label>
                  <Switch
                    id={`status-${bay.id}`}
                    checked={editedBays[bay.id]?.is_active ?? bay.is_active}
                    onCheckedChange={() => toggleStatus(bay.id)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showRateHistory(bay.id)}
                  >
                    History
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBay(bay.id, bay.bay_name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Bay Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New DIY Bay</DialogTitle>
            <DialogDescription>
              Enter a name for the new DIY bay. You can configure rates after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bay-name">Bay Name</Label>
            <Input
              id="bay-name"
              value={newBayName}
              onChange={(e) => setNewBayName(e.target.value)}
              placeholder="Enter bay name"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBay} disabled={!newBayName.trim()}>
              Add Bay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete DIY Bay</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {bayToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rate History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rate History for {selectedBay?.bay_name}</DialogTitle>
            <DialogDescription>
              View the historical rate changes for this bay.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {rateHistory.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Hourly Rate</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Daily Rate</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Weekly Rate</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Monthly Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rateHistory.map((history) => (
                      <tr key={history.id} className="bg-card">
                        <td className="px-4 py-2 text-sm">
                          {new Date(history.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatCurrency(history.hourly_rate)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatCurrency(history.daily_rate)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatCurrency(history.weekly_rate)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatCurrency(history.monthly_rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No rate history available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DIYBayRatesTab;
