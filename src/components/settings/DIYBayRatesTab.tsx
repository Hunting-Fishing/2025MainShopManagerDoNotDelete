
import React, { useState, useEffect } from "react";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { Bay, RateSettings, RateHistory } from "@/services/diybay/diybayService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Pen, 
  Trash2, 
  Plus, 
  Clock, 
  Save, 
  DollarSign, 
  Ban, 
  Loader2, 
  CheckCircle, 
  History,
  LayoutGrid,
  List
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function DIYBayRatesTab() {
  // State from hook
  const { 
    bays, 
    settings, 
    isLoading, 
    isSaving, 
    rateHistory,
    addBay, 
    saveBay, 
    removeBay, 
    loadRateHistory,
    updateBayRateSettings,
    calculateRate,
  } = useDIYBayRates();

  // Local state
  const [newBayName, setNewBayName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editedBays, setEditedBays] = useState<Map<string, Bay>>(new Map());
  const [showRateHistory, setShowRateHistory] = useState(false);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);
  const [viewStyle, setViewStyle] = useState<'table' | 'card'>('table');
  const [editSettings, setEditSettings] = useState<RateSettings>({
    ...settings
  });
  
  const { toast } = useToast();

  // Update edited settings when main settings change
  useEffect(() => {
    setEditSettings({...settings});
  }, [settings]);

  // Handle create new bay
  const handleCreateBay = async () => {
    if (!newBayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a bay name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await addBay(newBayName);
      setNewBayName("");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle starting edit for a bay
  const startEdit = (bay: Bay) => {
    // Create a copy of the bay object for editing
    setEditedBays(new Map(editedBays.set(bay.id, {...bay})));
  };

  // Handle edit field change for a bay
  const handleEditChange = (bayId: string, field: keyof Bay, value: any) => {
    const bay = editedBays.get(bayId);
    if (bay) {
      const updatedBay = { ...bay, [field]: value };
      setEditedBays(new Map(editedBays.set(bayId, updatedBay)));
      
      // If hourly rate changes, recalculate other rates
      if (field === 'hourly_rate' && settings.id) {
        const hourlyRate = parseFloat(value);
        if (!isNaN(hourlyRate)) {
          updatedBay.daily_rate = calculateRate('daily', hourlyRate);
          updatedBay.weekly_rate = calculateRate('weekly', hourlyRate);
          updatedBay.monthly_rate = calculateRate('monthly', hourlyRate);
          setEditedBays(new Map(editedBays.set(bayId, updatedBay)));
        }
      }
    }
  };

  // Handle save changes for a bay
  const handleSaveChanges = async (bayId: string) => {
    const bay = editedBays.get(bayId);
    if (bay) {
      await saveBay(bay);
      // Remove from edit mode after save
      const updatedEditedBays = new Map(editedBays);
      updatedEditedBays.delete(bayId);
      setEditedBays(updatedEditedBays);
    }
  };

  // Cancel edit for a bay
  const cancelEdit = (bayId: string) => {
    const updatedEditedBays = new Map(editedBays);
    updatedEditedBays.delete(bayId);
    setEditedBays(updatedEditedBays);
  };

  // Handle saving rate settings
  const handleSaveSettings = async () => {
    if (editSettings) {
      await updateBayRateSettings(editSettings);
    }
  };

  // Handle showing rate history for a bay
  const handleShowHistory = async (bayId: string) => {
    setSelectedBayId(bayId);
    await loadRateHistory(bayId);
    setShowRateHistory(true);
  };

  // Check if a particular bay is in edit mode
  const isEditing = (bayId: string) => editedBays.has(bayId);

  // Get the current data for a bay (either from editedBays if editing, or from bays)
  const getBayData = (bayId: string): Bay => {
    return editedBays.get(bayId) || bays.find(b => b.id === bayId) as Bay;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading bay data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-700">DIY Bay Management</h2>
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md">
          <Button
            variant={viewStyle === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="flex items-center gap-1 rounded-md"
            onClick={() => setViewStyle('table')}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </Button>
          <Button
            variant={viewStyle === 'card' ? 'default' : 'ghost'}
            size="sm"
            className="flex items-center gap-1 rounded-md"
            onClick={() => setViewStyle('card')}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Cards</span>
          </Button>
        </div>
      </div>
      
      {/* Rate Settings Card */}
      <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <CardTitle className="text-indigo-700 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            Rate Calculation Settings
          </CardTitle>
          <CardDescription>Configure how daily, weekly and monthly rates are calculated</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="daily_hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Hours in a Day
              </Label>
              <Input
                id="daily_hours"
                type="number"
                value={editSettings.daily_hours}
                onChange={(e) => setEditSettings({...editSettings, daily_hours: Number(e.target.value)})}
                className="border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                min="1"
                max="24"
              />
              <p className="text-xs text-gray-500">Number of hours considered a full day rental</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="daily_discount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-indigo-600" />
                Day Discount (%)
              </Label>
              <Input
                id="daily_discount"
                type="number"
                value={editSettings.daily_discount_percent}
                onChange={(e) => setEditSettings({...editSettings, daily_discount_percent: Number(e.target.value)})}
                className="border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500">Discount applied when renting for a full day</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weekly_multiplier" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-indigo-600" />
                Weekly Rate Multiplier
              </Label>
              <Input
                id="weekly_multiplier"
                type="number"
                value={editSettings.weekly_multiplier}
                onChange={(e) => setEditSettings({...editSettings, weekly_multiplier: Number(e.target.value)})}
                className="border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                min="1"
              />
              <p className="text-xs text-gray-500">Hourly rate multiplied by this value for weekly rate</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthly_multiplier" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-indigo-600" />
                Monthly Rate Multiplier
              </Label>
              <Input
                id="monthly_multiplier"
                type="number"
                value={editSettings.monthly_multiplier}
                onChange={(e) => setEditSettings({...editSettings, monthly_multiplier: Number(e.target.value)})}
                className="border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                min="1"
              />
              <p className="text-xs text-gray-500">Hourly rate multiplied by this value for monthly rate</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-gray-50 py-3 px-6">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Bays List */}
      <Card className="border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <CardTitle className="text-blue-700">
            DIY Bays
          </CardTitle>
          <CardDescription>
            Manage your DIY repair bays and their rental rates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              placeholder="New bay name"
              value={newBayName}
              onChange={(e) => setNewBayName(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Button 
              onClick={handleCreateBay} 
              disabled={isCreating || !newBayName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bay
                </>
              )}
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          {bays.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No bays have been added yet.</p>
              <p className="text-sm text-gray-400 mt-2">Add your first bay using the form above.</p>
            </div>
          ) : viewStyle === 'table' ? (
            // Table View
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bay Name</TableHead>
                    <TableHead>Hourly Rate ($)</TableHead>
                    <TableHead>Daily Rate ($)</TableHead>
                    <TableHead>Weekly Rate ($)</TableHead>
                    <TableHead>Monthly Rate ($)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bays.map((bay) => {
                    const bayData = getBayData(bay.id);
                    
                    return (
                      <TableRow key={bay.id}>
                        <TableCell className="font-medium">
                          {isEditing(bay.id) ? (
                            <Input
                              value={bayData.bay_name}
                              onChange={(e) => handleEditChange(bay.id, 'bay_name', e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            bay.bay_name
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing(bay.id) ? (
                            <Input
                              type="number"
                              value={bayData.hourly_rate}
                              onChange={(e) => handleEditChange(bay.id, 'hourly_rate', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          ) : (
                            `$${bay.hourly_rate}`
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing(bay.id) ? (
                            <Input
                              type="number"
                              value={bayData.daily_rate || 0}
                              onChange={(e) => handleEditChange(bay.id, 'daily_rate', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          ) : (
                            `$${bay.daily_rate || 0}`
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing(bay.id) ? (
                            <Input
                              type="number"
                              value={bayData.weekly_rate || 0}
                              onChange={(e) => handleEditChange(bay.id, 'weekly_rate', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          ) : (
                            `$${bay.weekly_rate || 0}`
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing(bay.id) ? (
                            <Input
                              type="number"
                              value={bayData.monthly_rate || 0}
                              onChange={(e) => handleEditChange(bay.id, 'monthly_rate', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          ) : (
                            `$${bay.monthly_rate || 0}`
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing(bay.id) ? (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={bayData.is_active}
                                onCheckedChange={(checked) => handleEditChange(bay.id, 'is_active', checked)}
                              />
                              <span>{bayData.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={`${bay.is_active 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-red-100 text-red-800 border-red-300'}`}
                            >
                              {bay.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {isEditing(bay.id) ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleSaveChanges(bay.id)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => cancelEdit(bay.id)}>
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startEdit(bay)}>
                                  <Pen className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleShowHistory(bay.id)}>
                                  <History className="h-4 w-4" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete Bay</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to delete "{bay.bay_name}"? This action cannot be undone.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                      <Button 
                                        variant="destructive" 
                                        onClick={() => removeBay(bay.id, bay.bay_name)}
                                      >
                                        Delete
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bays.map((bay) => {
                const bayData = getBayData(bay.id);
                
                return (
                  <Card key={bay.id} className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        {isEditing(bay.id) ? (
                          <Input
                            value={bayData.bay_name}
                            onChange={(e) => handleEditChange(bay.id, 'bay_name', e.target.value)}
                            className="w-full font-semibold"
                          />
                        ) : (
                          <CardTitle className="text-lg">{bay.bay_name}</CardTitle>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`${bay.is_active 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'}`}
                        >
                          {bay.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {isEditing(bay.id) && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Label htmlFor={`active-${bay.id}`}>
                            Status:
                          </Label>
                          <Switch
                            id={`active-${bay.id}`}
                            checked={bayData.is_active}
                            onCheckedChange={(checked) => handleEditChange(bay.id, 'is_active', checked)}
                          />
                          <span className="text-sm">{bayData.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="font-medium">Hourly Rate:</Label>
                          {isEditing(bay.id) ? (
                            <div className="flex items-center">
                              <span className="mr-1">$</span>
                              <Input
                                type="number"
                                value={bayData.hourly_rate}
                                onChange={(e) => handleEditChange(bay.id, 'hourly_rate', parseFloat(e.target.value))}
                                className="w-24"
                              />
                            </div>
                          ) : (
                            <span className="text-blue-600 font-bold">${bay.hourly_rate}</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Label className="font-medium">Daily Rate:</Label>
                          {isEditing(bay.id) ? (
                            <div className="flex items-center">
                              <span className="mr-1">$</span>
                              <Input
                                type="number"
                                value={bayData.daily_rate || 0}
                                onChange={(e) => handleEditChange(bay.id, 'daily_rate', parseFloat(e.target.value))}
                                className="w-24"
                              />
                            </div>
                          ) : (
                            <span className="text-blue-600 font-bold">${bay.daily_rate || 0}</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Label className="font-medium">Weekly Rate:</Label>
                          {isEditing(bay.id) ? (
                            <div className="flex items-center">
                              <span className="mr-1">$</span>
                              <Input
                                type="number"
                                value={bayData.weekly_rate || 0}
                                onChange={(e) => handleEditChange(bay.id, 'weekly_rate', parseFloat(e.target.value))}
                                className="w-24"
                              />
                            </div>
                          ) : (
                            <span className="text-blue-600 font-bold">${bay.weekly_rate || 0}</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Label className="font-medium">Monthly Rate:</Label>
                          {isEditing(bay.id) ? (
                            <div className="flex items-center">
                              <span className="mr-1">$</span>
                              <Input
                                type="number"
                                value={bayData.monthly_rate || 0}
                                onChange={(e) => handleEditChange(bay.id, 'monthly_rate', parseFloat(e.target.value))}
                                className="w-24"
                              />
                            </div>
                          ) : (
                            <span className="text-blue-600 font-bold">${bay.monthly_rate || 0}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-end space-x-2">
                      {isEditing(bay.id) ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleSaveChanges(bay.id)}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => cancelEdit(bay.id)}>
                            <Ban className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(bay)}>
                            <Pen className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleShowHistory(bay.id)}>
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Bay</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete "{bay.bay_name}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => removeBay(bay.id, bay.bay_name)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Rate History Dialog */}
      <Dialog open={showRateHistory} onOpenChange={setShowRateHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rate Change History</DialogTitle>
            <DialogDescription>
              View the history of rate changes for this bay
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {rateHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No rate change history available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rateHistory.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(entry.changed_at), "MMM d, yyyy 'at' h:mm a")}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                        Changed by: {entry.user_email || 'System'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div className="text-center p-2 bg-white rounded-md border">
                        <p className="text-xs text-gray-500">Hourly Rate</p>
                        <p className="font-bold text-blue-600">${entry.hourly_rate}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-md border">
                        <p className="text-xs text-gray-500">Daily Rate</p>
                        <p className="font-bold text-blue-600">${entry.daily_rate || 'N/A'}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-md border">
                        <p className="text-xs text-gray-500">Weekly Rate</p>
                        <p className="font-bold text-blue-600">${entry.weekly_rate || 'N/A'}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-md border">
                        <p className="text-xs text-gray-500">Monthly Rate</p>
                        <p className="font-bold text-blue-600">${entry.monthly_rate || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
