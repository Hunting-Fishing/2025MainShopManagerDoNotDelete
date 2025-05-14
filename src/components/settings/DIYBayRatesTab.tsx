
import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  PlusCircle, Edit, Trash2, MoreVertical, 
  Save, DollarSign, History, Grid, Table as TableIcon 
} from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { useDIYBayRates } from '@/hooks/useDIYBayRates';
import { useToast } from '@/hooks/use-toast';

export function DIYBayRatesTab() {
  const { 
    bays, 
    settings, 
    isLoading,
    isSaving,
    rateHistory,
    loadData,
    addBay,
    saveBay, 
    removeBay, 
    loadRateHistory,
    updateBayRateSettings,
    calculateRate
  } = useDIYBayRates();
  
  const { toast } = useToast();

  // Configuration states
  const [showSettings, setShowSettings] = useState(false);
  const [editedSettings, setEditedSettings] = useState(settings);
  const [editedBays, setEditedBays] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [newBayName, setNewBayName] = useState("");
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);
  const [selectedBayName, setSelectedBayName] = useState("");

  // Make sure we initialize editedSettings whenever settings change
  useEffect(() => {
    setEditedSettings(settings);
  }, [settings]);

  // Explicitly reload data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSettingsChange = (field: keyof typeof editedSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setEditedSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    const success = await updateBayRateSettings(editedSettings);
    
    if (success) {
      toast({
        title: "Settings updated",
        description: "Rate calculation settings have been updated.",
      });
      setShowSettings(false);
    }
  };

  const handleAddBay = async () => {
    if (newBayName.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a bay name.",
        variant: "destructive",
      });
      return;
    }
    
    const newBay = await addBay(newBayName);
    if (newBay) {
      setNewBayName("");
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteBay = async () => {
    if (selectedBayId) {
      const success = await removeBay(selectedBayId, selectedBayName);
      
      if (success) {
        setIsDeleteDialogOpen(false);
        setSelectedBayId(null);
        setSelectedBayName("");
      }
    }
  };

  const handleViewHistory = async (bay: any) => {
    setSelectedBayId(bay.id);
    setSelectedBayName(bay.bay_name);
    await loadRateHistory(bay.id);
    setIsHistoryDialogOpen(true);
  };

  const handleBayEdit = (bay: any, field: string, value: any) => {
    setEditedBays(prev => ({
      ...prev,
      [bay.id]: {
        ...(prev[bay.id] || bay),
        [field]: value
      }
    }));
  };

  const handleSaveBay = async (bay: any) => {
    const editedBay = editedBays[bay.id];
    if (!editedBay) return;
    
    // Create an updated bay object with edited values
    const updatedBay = {
      ...bay,
      ...editedBay
    };
    
    const success = await saveBay(updatedBay);
    
    if (success) {
      // Clear the edited state for this bay
      setEditedBays(prev => {
        const newState = { ...prev };
        delete newState[bay.id];
        return newState;
      });
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return '-';
    return `$${amount.toFixed(2)}`;
  };

  // Get edited or original value for a bay field
  const getBayValue = (bay: any, field: string) => {
    if (editedBays[bay.id] && editedBays[bay.id][field] !== undefined) {
      return editedBays[bay.id][field];
    }
    return bay[field];
  };
  
  // Determine if a bay is being edited
  const isBayEdited = (bayId: string) => {
    return Boolean(editedBays[bayId]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bay data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">DIY Bay Rates</h2>
          <p className="text-muted-foreground">Manage rates for DIY bay rentals</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-muted rounded-md p-1 flex">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setViewMode('card')}
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            Rate Settings
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Bay
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bay</DialogTitle>
                <DialogDescription>
                  Create a new DIY bay with default rates.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bayName">Bay Name</Label>
                  <Input
                    id="bayName"
                    value={newBayName}
                    onChange={(e) => setNewBayName(e.target.value)}
                    placeholder="Enter bay name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddBay} disabled={isSaving}>
                  {isSaving ? 'Adding...' : 'Add Bay'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Rate Settings Card */}
      {showSettings && (
        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-blue-700 flex items-center justify-between">
              <span>Rate Calculation Settings</span>
              <Button 
                size="sm" 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardTitle>
            <CardDescription>
              Configure how daily, weekly, and monthly rates are calculated
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dailyHours" className="text-sm font-medium">
                    Daily Hours
                  </Label>
                  <Input 
                    id="dailyHours"
                    type="number"
                    value={editedSettings.daily_hours}
                    onChange={handleSettingsChange('daily_hours')}
                    min="1"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Number of hours in a standard day rental
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="dailyDiscount" className="text-sm font-medium">
                    Daily Discount (%)
                  </Label>
                  <Input 
                    id="dailyDiscount"
                    type="number"
                    value={editedSettings.daily_discount_percent}
                    onChange={handleSettingsChange('daily_discount_percent')}
                    min="0"
                    max="100"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Discount percentage applied to daily rate
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weeklyMultiplier" className="text-sm font-medium">
                    Weekly Rate Multiplier
                  </Label>
                  <Input 
                    id="weeklyMultiplier"
                    type="number"
                    value={editedSettings.weekly_multiplier}
                    onChange={handleSettingsChange('weekly_multiplier')}
                    min="1"
                    step="0.1"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Multiplier of hourly rate for weekly rentals
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="monthlyMultiplier" className="text-sm font-medium">
                    Monthly Rate Multiplier
                  </Label>
                  <Input 
                    id="monthlyMultiplier"
                    type="number"
                    value={editedSettings.monthly_multiplier}
                    onChange={handleSettingsChange('monthly_multiplier')}
                    min="1"
                    step="0.1"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Multiplier of hourly rate for monthly rentals
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="border-gray-100 shadow-md">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle>DIY Bay Rates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Bay Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Weekly Rate</TableHead>
                  <TableHead>Monthly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No DIY bays found. Click "Add Bay" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  bays.map(bay => (
                    <TableRow key={bay.id}>
                      <TableCell>
                        {isBayEdited(bay.id) ? (
                          <Input 
                            value={getBayValue(bay, 'bay_name')}
                            onChange={(e) => handleBayEdit(bay, 'bay_name', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          bay.bay_name
                        )}
                      </TableCell>
                      <TableCell>
                        {isBayEdited(bay.id) ? (
                          <Input 
                            value={getBayValue(bay, 'bay_location')}
                            onChange={(e) => handleBayEdit(bay, 'bay_location', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          bay.bay_location || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {isBayEdited(bay.id) ? (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <Input 
                              type="number"
                              value={getBayValue(bay, 'hourly_rate')}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleBayEdit(bay, 'hourly_rate', value);
                                
                                // Auto-calculate other rates based on settings
                                if (settings) {
                                  handleBayEdit(bay, 'daily_rate', calculateRate('daily', value));
                                  handleBayEdit(bay, 'weekly_rate', calculateRate('weekly', value));
                                  handleBayEdit(bay, 'monthly_rate', calculateRate('monthly', value));
                                }
                              }}
                              className="w-full"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          formatCurrency(bay.hourly_rate)
                        )}
                      </TableCell>
                      <TableCell>
                        {isBayEdited(bay.id) ? (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <Input 
                              type="number"
                              value={getBayValue(bay, 'daily_rate')}
                              onChange={(e) => handleBayEdit(bay, 'daily_rate', parseFloat(e.target.value))}
                              className="w-full"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          formatCurrency(bay.daily_rate)
                        )}
                      </TableCell>
                      <TableCell>
                        {isBayEdited(bay.id) ? (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <Input 
                              type="number"
                              value={getBayValue(bay, 'weekly_rate')}
                              onChange={(e) => handleBayEdit(bay, 'weekly_rate', parseFloat(e.target.value))}
                              className="w-full"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          formatCurrency(bay.weekly_rate)
                        )}
                      </TableCell>
                      <TableCell>
                        {isBayEdited(bay.id) ? (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <Input 
                              type="number"
                              value={getBayValue(bay, 'monthly_rate')}
                              onChange={(e) => handleBayEdit(bay, 'monthly_rate', parseFloat(e.target.value))}
                              className="w-full"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          formatCurrency(bay.monthly_rate)
                        )}
                      </TableCell>
                      <TableCell>
                        {isBayEdited(bay.id) ? (
                          <div className="flex items-center">
                            <Switch 
                              checked={getBayValue(bay, 'is_active')}
                              onCheckedChange={(checked) => handleBayEdit(bay, 'is_active', checked)}
                            />
                          </div>
                        ) : (
                          <Badge variant={bay.is_active ? "success" : "destructive"}>
                            {bay.is_active ? "Active" : "Inactive"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isBayEdited(bay.id) ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveBay(bay)} 
                            disabled={isSaving}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleBayEdit(bay, 'editing', true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewHistory(bay)}>
                                <History className="h-4 w-4 mr-2" />
                                Rate History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedBayId(bay.id);
                                  setSelectedBayName(bay.bay_name);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bays.length === 0 ? (
            <div className="col-span-full p-8 text-center rounded-lg border border-dashed border-gray-300">
              <p className="text-muted-foreground">No DIY bays found. Click "Add Bay" to create one.</p>
            </div>
          ) : (
            bays.map(bay => (
              <Card key={bay.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      {isBayEdited(bay.id) ? (
                        <Input 
                          value={getBayValue(bay, 'bay_name')}
                          onChange={(e) => handleBayEdit(bay, 'bay_name', e.target.value)}
                          className="font-medium text-lg mb-1"
                        />
                      ) : (
                        <CardTitle>{bay.bay_name}</CardTitle>
                      )}
                      {isBayEdited(bay.id) ? (
                        <Input 
                          value={getBayValue(bay, 'bay_location')}
                          onChange={(e) => handleBayEdit(bay, 'bay_location', e.target.value)}
                          placeholder="Location (optional)"
                        />
                      ) : (
                        bay.bay_location && <CardDescription>{bay.bay_location}</CardDescription>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isBayEdited(bay.id) ? (
                        <div className="flex items-center">
                          <span className="mr-2 text-sm">Status:</span>
                          <Switch 
                            checked={getBayValue(bay, 'is_active')}
                            onCheckedChange={(checked) => handleBayEdit(bay, 'is_active', checked)}
                          />
                        </div>
                      ) : (
                        <Badge variant={bay.is_active ? "success" : "destructive"}>
                          {bay.is_active ? "Active" : "Inactive"}
                        </Badge>
                      )}

                      {!isBayEdited(bay.id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBayEdit(bay, 'editing', true)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistory(bay)}>
                              <History className="h-4 w-4 mr-2" />
                              Rate History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedBayId(bay.id);
                                setSelectedBayName(bay.bay_name);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
                      {isBayEdited(bay.id) ? (
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            value={getBayValue(bay, 'hourly_rate')}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              handleBayEdit(bay, 'hourly_rate', value);
                              
                              // Auto-calculate other rates based on settings
                              if (settings) {
                                handleBayEdit(bay, 'daily_rate', calculateRate('daily', value));
                                handleBayEdit(bay, 'weekly_rate', calculateRate('weekly', value));
                                handleBayEdit(bay, 'monthly_rate', calculateRate('monthly', value));
                              }
                            }}
                            className="border-0 p-0 h-auto text-lg font-medium"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="text-lg font-medium">{formatCurrency(bay.hourly_rate)}</div>
                      )}
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                      <Label className="text-xs text-muted-foreground">Daily Rate</Label>
                      {isBayEdited(bay.id) ? (
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            value={getBayValue(bay, 'daily_rate')}
                            onChange={(e) => handleBayEdit(bay, 'daily_rate', parseFloat(e.target.value))}
                            className="border-0 p-0 h-auto text-lg font-medium"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="text-lg font-medium">{formatCurrency(bay.daily_rate)}</div>
                      )}
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg space-y-1">
                      <Label className="text-xs text-muted-foreground">Weekly Rate</Label>
                      {isBayEdited(bay.id) ? (
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            value={getBayValue(bay, 'weekly_rate')}
                            onChange={(e) => handleBayEdit(bay, 'weekly_rate', parseFloat(e.target.value))}
                            className="border-0 p-0 h-auto text-lg font-medium"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="text-lg font-medium">{formatCurrency(bay.weekly_rate)}</div>
                      )}
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                      <Label className="text-xs text-muted-foreground">Monthly Rate</Label>
                      {isBayEdited(bay.id) ? (
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            value={getBayValue(bay, 'monthly_rate')}
                            onChange={(e) => handleBayEdit(bay, 'monthly_rate', parseFloat(e.target.value))}
                            className="border-0 p-0 h-auto text-lg font-medium"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="text-lg font-medium">{formatCurrency(bay.monthly_rate)}</div>
                      )}
                    </div>
                  </div>
                  
                  {isBayEdited(bay.id) && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveBay(bay)} 
                        disabled={isSaving}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bay</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBayName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteBay} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rate History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate History - {selectedBayName}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {rateHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No rate change history found for this bay.
              </p>
            ) : (
              <div className="space-y-4">
                {rateHistory.map((entry) => (
                  <div key={entry.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.changed_at).toLocaleString()}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Hourly:</span>
                        <p className="font-medium">{formatCurrency(entry.hourly_rate)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Daily:</span>
                        <p className="font-medium">{formatCurrency(entry.daily_rate)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Weekly:</span>
                        <p className="font-medium">{formatCurrency(entry.weekly_rate)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Monthly:</span>
                        <p className="font-medium">{formatCurrency(entry.monthly_rate)}</p>
                      </div>
                    </div>
                    {entry.changed_by && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Changed by: {entry.user_email || 'System'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
