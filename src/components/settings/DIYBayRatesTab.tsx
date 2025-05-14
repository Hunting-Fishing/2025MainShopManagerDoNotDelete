
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, History, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { Bay } from "@/services/diybay/diybayService";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DIYBayRatesTab() {
  const [activeTab, setActiveTab] = useState('rates');
  const [editingBay, setEditingBay] = useState<Bay | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

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
    calculateRate
  } = useDIYBayRates();

  const handleAddBay = () => {
    addBay(`Bay ${bays.length + 1}`);
  };

  const handleSaveBay = () => {
    if (!editingBay) return;
    saveBay(editingBay).then((success) => {
      if (success) {
        setEditingBay(null);
      }
    });
  };

  const handleDeleteBay = () => {
    if (!editingBay) return;
    removeBay(editingBay.id, editingBay.bay_name).then((success) => {
      if (success) {
        setEditingBay(null);
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const handleSaveSettings = async () => {
    await updateBayRateSettings(settings);
  };

  const handleShowHistory = (bay: Bay) => {
    setEditingBay(bay);
    loadRateHistory(bay.id);
    setIsHistoryDialogOpen(true);
  };

  const handleHourlyRateChange = (rate: string) => {
    if (!editingBay) return;
    
    const hourlyRate = parseFloat(rate) || 0;
    setEditingBay({
      ...editingBay,
      hourly_rate: hourlyRate,
      daily_rate: calculateRate('daily', hourlyRate),
      weekly_rate: calculateRate('weekly', hourlyRate),
      monthly_rate: calculateRate('monthly', hourlyRate),
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg border border-gray-200">
          <TabsTrigger 
            value="rates"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Bay Rates
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Calculation Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rates">
          <Card className="border-gray-100 shadow-md rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex flex-row justify-between items-center">
              <CardTitle className="text-blue-700">DIY Bay Rentals</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddBay}
                disabled={isLoading || isSaving}
                className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Bay
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isLoading ? (
                <div className="text-center py-6">Loading bay data...</div>
              ) : bays.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No DIY bays defined. Click the "Add Bay" button to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {bays.map((bay) => (
                    <Card key={bay.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                          <div className="space-y-4 md:col-span-1">
                            <div>
                              <Label htmlFor={`bay-name-${bay.id}`} className="text-sm font-medium mb-1 block">Bay Name</Label>
                              <Input
                                id={`bay-name-${bay.id}`}
                                value={editingBay?.id === bay.id ? editingBay.bay_name : bay.bay_name}
                                onChange={(e) => editingBay?.id === bay.id && setEditingBay({...editingBay, bay_name: e.target.value})}
                                onClick={() => !editingBay && setEditingBay(bay)}
                                className="border-gray-200 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`bay-location-${bay.id}`} className="text-sm font-medium mb-1 block">Bay Location/Information</Label>
                              <Textarea
                                id={`bay-location-${bay.id}`}
                                value={editingBay?.id === bay.id ? editingBay.bay_location || '' : bay.bay_location || ''}
                                onChange={(e) => editingBay?.id === bay.id && setEditingBay({...editingBay, bay_location: e.target.value})}
                                onClick={() => !editingBay && setEditingBay(bay)}
                                className="min-h-[100px] resize-y border-gray-200 focus:border-blue-500"
                                placeholder="Enter bay details such as location, special features, or other relevant information"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4 md:col-span-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <Label htmlFor={`hourly-rate-${bay.id}`} className="text-sm font-medium mb-1 block">Hourly Rate ($)</Label>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</div>
                                  <Input
                                    id={`hourly-rate-${bay.id}`}
                                    type="number"
                                    value={editingBay?.id === bay.id ? editingBay.hourly_rate : bay.hourly_rate}
                                    onChange={(e) => editingBay?.id === bay.id && handleHourlyRateChange(e.target.value)}
                                    onClick={() => !editingBay && setEditingBay(bay)}
                                    className="pl-7 border-gray-200 focus:border-blue-500 text-right"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor={`daily-rate-${bay.id}`} className="text-sm font-medium mb-1 block">Daily Rate</Label>
                                <Input
                                  id={`daily-rate-${bay.id}`}
                                  value={formatCurrency(editingBay?.id === bay.id ? editingBay.daily_rate : bay.daily_rate)}
                                  readOnly
                                  className="bg-gray-50 border-gray-200 text-right cursor-not-allowed"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`weekly-rate-${bay.id}`} className="text-sm font-medium mb-1 block">Weekly Rate</Label>
                                <Input
                                  id={`weekly-rate-${bay.id}`}
                                  value={formatCurrency(editingBay?.id === bay.id ? editingBay.weekly_rate : bay.weekly_rate)}
                                  readOnly
                                  className="bg-gray-50 border-gray-200 text-right cursor-not-allowed"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`monthly-rate-${bay.id}`} className="text-sm font-medium mb-1 block">Monthly Rate</Label>
                                <Input
                                  id={`monthly-rate-${bay.id}`}
                                  value={formatCurrency(editingBay?.id === bay.id ? editingBay.monthly_rate : bay.monthly_rate)}
                                  readOnly
                                  className="bg-gray-50 border-gray-200 text-right cursor-not-allowed"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShowHistory(bay)}
                                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                              >
                                <History className="w-4 h-4 mr-1" />
                                History
                              </Button>
                              
                              {editingBay?.id === bay.id ? (
                                <>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={isSaving}
                                    className="text-white border-red-600 hover:bg-red-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingBay(null)}
                                    disabled={isSaving}
                                    className="border-gray-300 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSaveBay}
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {isSaving ? 'Saving...' : (
                                      <>
                                        <Save className="w-4 h-4 mr-1" />
                                        Save
                                      </>
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingBay(bay)}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="border-gray-100 shadow-md rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <CardTitle className="text-blue-700">Rate Calculation Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="daily-hours" className="text-sm font-medium mb-1 block">Hours in Day</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="daily-hours"
                        type="number"
                        value={settings.daily_hours}
                        onChange={(e) => updateBayRateSettings({...settings, daily_hours: parseInt(e.target.value) || 0})}
                        className="border-gray-200 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">hours</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      The number of hours considered for a full day rental
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="daily-discount" className="text-sm font-medium mb-1 block">Daily Discount</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="daily-discount"
                        type="number"
                        value={settings.daily_discount_percent}
                        onChange={(e) => updateBayRateSettings({...settings, daily_discount_percent: parseInt(e.target.value) || 0})}
                        className="border-gray-200 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Discount percentage applied to daily rate (compared to hourly)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="weekly-multiplier" className="text-sm font-medium mb-1 block">Weekly Multiplier</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="weekly-multiplier"
                        type="number"
                        step="0.1"
                        value={settings.weekly_multiplier}
                        onChange={(e) => updateBayRateSettings({...settings, weekly_multiplier: parseFloat(e.target.value) || 0})}
                        className="border-gray-200 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">× hourly rate</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Weekly rate calculation (multiplier × hourly rate)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="monthly-multiplier" className="text-sm font-medium mb-1 block">Monthly Multiplier</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="monthly-multiplier"
                        type="number"
                        step="0.1"
                        value={settings.monthly_multiplier}
                        onChange={(e) => updateBayRateSettings({...settings, monthly_multiplier: parseFloat(e.target.value) || 0})}
                        className="border-gray-200 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">× hourly rate</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Monthly rate calculation (multiplier × hourly rate)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <SettingsIcon className="h-4 w-4 mr-2" /> 
                  How Rates Are Calculated
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>Daily Rate:</strong> (Hourly Rate × Hours in Day) - Discount%</p>
                  <p><strong>Weekly Rate:</strong> Hourly Rate × Weekly Multiplier</p>
                  <p><strong>Monthly Rate:</strong> Hourly Rate × Monthly Multiplier</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this bay?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{editingBay?.bay_name}</span> and all its rate history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBay}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rate History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              Rate History for {editingBay?.bay_name}
            </DialogTitle>
            <DialogDescription>
              View past rate changes for this bay.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-80 overflow-y-auto">
            {rateHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rate change history available.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Hourly</TableHead>
                    <TableHead className="text-right">Daily</TableHead>
                    <TableHead className="text-right">Weekly</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.changed_at).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(record.changed_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${record.hourly_rate}</TableCell>
                      <TableCell className="text-right">{record.daily_rate ? `$${record.daily_rate}` : '-'}</TableCell>
                      <TableCell className="text-right">{record.weekly_rate ? `$${record.weekly_rate}` : '-'}</TableCell>
                      <TableCell className="text-right">{record.monthly_rate ? `$${record.monthly_rate}` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
