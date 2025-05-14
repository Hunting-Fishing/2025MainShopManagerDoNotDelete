
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { LayoutList, LayoutGrid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { ResponsiveStack } from "@/components/ui/responsive-stack";
import { BadgePlus, Save, Trash2, PencilLine, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DIYBayRatesTab() {
  const [bayName, setBayName] = useState("");
  const [editingBay, setEditingBay] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  
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

  const handleAddBay = async () => {
    if (bayName.trim()) {
      await addBay(bayName);
      setBayName("");
    }
  };

  const handleSaveBay = async (bayId: string, hourlyRate: number) => {
    const bay = bays.find(b => b.id === bayId);
    if (bay) {
      const daily = calculateRate("daily", hourlyRate);
      const weekly = calculateRate("weekly", hourlyRate);
      const monthly = calculateRate("monthly", hourlyRate);
      
      await saveBay({
        ...bay,
        hourly_rate: hourlyRate,
        daily_rate: daily,
        weekly_rate: weekly,
        monthly_rate: monthly
      });
    }
    setEditingBay(null);
  };

  const handleViewHistory = async (bayId: string) => {
    setSelectedBayId(bayId);
    await loadRateHistory(bayId);
    setIsHistoryOpen(true);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "table" ? "card" : "table");
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading DIY Bay rates...</div>;
  }

  const bayDetails = (bay: any) => {
    const isEditing = editingBay === bay.id;
    const hourlyRate = isEditing 
      ? parseFloat(bay.hourly_rate_edit || bay.hourly_rate) 
      : bay.hourly_rate;

    return (
      <>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-lg">{bay.bay_name}</span>
          {bay.bay_location && (
            <span className="text-sm text-gray-500">({bay.bay_location})</span>
          )}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${bay.is_active ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {bay.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`hourly-${bay.id}`} className="text-sm font-medium">Hourly Rate</Label>
              {isEditing ? (
                <Input
                  id={`hourly-${bay.id}`}
                  type="number"
                  value={bay.hourly_rate_edit || bay.hourly_rate}
                  onChange={(e) => {
                    const value = e.target.value;
                    const updatedBays = bays.map(b => 
                      b.id === bay.id ? { ...b, hourly_rate_edit: value } : b
                    );
                    // This is just for the UI, not saving to backend yet
                  }}
                  className="mt-1"
                />
              ) : (
                <p className="text-2xl font-bold mt-1">${bay.hourly_rate}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium">Daily Rate</Label>
              <p className="text-lg font-medium mt-1">
                ${isEditing 
                  ? calculateRate("daily", parseFloat(bay.hourly_rate_edit || bay.hourly_rate))
                  : bay.daily_rate}
              </p>
              <p className="text-xs text-gray-500">
                {settings.daily_hours} hrs with {settings.daily_discount_percent}% discount
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Weekly Rate</Label>
              <p className="text-lg font-medium mt-1">
                ${isEditing 
                  ? calculateRate("weekly", parseFloat(bay.hourly_rate_edit || bay.hourly_rate))
                  : bay.weekly_rate}
              </p>
              <p className="text-xs text-gray-500">
                {settings.weekly_multiplier}x daily rate
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Monthly Rate</Label>
              <p className="text-lg font-medium mt-1">
                ${isEditing 
                  ? calculateRate("monthly", parseFloat(bay.hourly_rate_edit || bay.hourly_rate))
                  : bay.monthly_rate}
              </p>
              <p className="text-xs text-gray-500">
                {settings.monthly_multiplier}x daily rate
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingBay(null)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleSaveBay(
                    bay.id, 
                    parseFloat(bay.hourly_rate_edit || bay.hourly_rate)
                  )}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewHistory(bay.id)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Rate History</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingBay(bay.id)}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Rate</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeBay(bay.id, bay.bay_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Bay</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rate Settings Card */}
      <Card className="border-gray-100 shadow-md rounded-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <CardTitle className="text-indigo-700">DIY Bay Rate Calculations</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="daily-hours" className="text-sm font-medium">
                  Hours Per Day
                </Label>
                <Input
                  id="daily-hours"
                  type="number"
                  min="1"
                  max="24"
                  value={settings.daily_hours}
                  onChange={(e) => {
                    // Handle change (saved separately)
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many hours constitute a "day" rental
                </p>
              </div>

              <div>
                <Label htmlFor="daily-discount" className="text-sm font-medium">
                  Daily Discount Percentage
                </Label>
                <Input
                  id="daily-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.daily_discount_percent}
                  onChange={(e) => {
                    // Handle change (saved separately)
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Discount applied when renting for a full day
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="weekly-multiplier" className="text-sm font-medium">
                  Weekly Rate Multiplier
                </Label>
                <Input
                  id="weekly-multiplier"
                  type="number"
                  min="1"
                  value={settings.weekly_multiplier}
                  onChange={(e) => {
                    // Handle change (saved separately)
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Weekly rate = Daily rate × this multiplier
                </p>
              </div>

              <div>
                <Label htmlFor="monthly-multiplier" className="text-sm font-medium">
                  Monthly Rate Multiplier
                </Label>
                <Input
                  id="monthly-multiplier"
                  type="number"
                  min="1"
                  value={settings.monthly_multiplier}
                  onChange={(e) => {
                    // Handle change (saved separately)
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Monthly rate = Daily rate × this multiplier
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => updateBayRateSettings(settings)}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving Settings..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bay Rates List */}
      <Card className="border-gray-100 shadow-md rounded-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-indigo-700">DIY Bay Rates</CardTitle>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="view-toggle" className="text-sm font-medium">
                View Mode:
              </Label>
              <div className="flex border rounded-md p-0.5">
                <Button 
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-r-none ${viewMode === "table" ? 'bg-indigo-600 text-white' : ''}`}
                  onClick={() => setViewMode("table")}
                >
                  <LayoutList className="h-4 w-4 mr-1" /> List
                </Button>
                <Button 
                  variant={viewMode === "card" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-l-none ${viewMode === "card" ? 'bg-indigo-600 text-white' : ''}`}
                  onClick={() => setViewMode("card")}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" /> Cards
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Input
              type="text"
              placeholder="Enter bay name"
              value={bayName}
              onChange={(e) => setBayName(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={handleAddBay}
              disabled={!bayName.trim() || isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
            >
              <BadgePlus className="h-4 w-4 mr-2" /> Add Bay
            </Button>
          </div>

          {bays.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md border-gray-300 bg-gray-50">
              <p className="text-gray-500">No DIY bays have been configured yet. Add your first bay above.</p>
            </div>
          ) : viewMode === "table" ? (
            // Table View
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bay Name</TableHead>
                  <TableHead className="text-right">Hourly Rate</TableHead>
                  <TableHead className="text-right">Daily Rate</TableHead>
                  <TableHead className="text-right">Weekly Rate</TableHead>
                  <TableHead className="text-right">Monthly Rate</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bays.map((bay) => {
                  const isEditing = editingBay === bay.id;
                  return (
                    <TableRow key={bay.id}>
                      <TableCell className="font-medium">
                        {bay.bay_name}
                        {bay.bay_location && (
                          <span className="text-xs text-gray-500 block">
                            ({bay.bay_location})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={bay.hourly_rate_edit || bay.hourly_rate}
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedBays = bays.map(b => 
                                b.id === bay.id ? { ...b, hourly_rate_edit: value } : b
                              );
                              // Just for UI update, actual save happens on save button
                            }}
                            className="w-20 text-right"
                          />
                        ) : (
                          `$${bay.hourly_rate}`
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ${isEditing 
                          ? calculateRate("daily", parseFloat(bay.hourly_rate_edit || bay.hourly_rate))
                          : bay.daily_rate}
                      </TableCell>
                      <TableCell className="text-right">
                        ${isEditing 
                          ? calculateRate("weekly", parseFloat(bay.hourly_rate_edit || bay.hourly_rate))
                          : bay.weekly_rate}
                      </TableCell>
                      <TableCell className="text-right">
                        ${isEditing 
                          ? calculateRate("monthly", parseFloat(bay.hourly_rate_edit || bay.hourly_rate))
                          : bay.monthly_rate}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${bay.is_active ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                          {bay.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isEditing ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingBay(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleSaveBay(
                                  bay.id, 
                                  parseFloat(bay.hourly_rate_edit || bay.hourly_rate)
                                )}
                                disabled={isSaving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                {isSaving ? "..." : "Save"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewHistory(bay.id)}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingBay(bay.id)}
                              >
                                <PencilLine className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removeBay(bay.id, bay.bay_name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bays.map((bay) => (
                <Card key={bay.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    {bayDetails(bay)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rate History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Hourly Rate</TableHead>
                  <TableHead className="text-right">Daily Rate</TableHead>
                  <TableHead className="text-right">Weekly Rate</TableHead>
                  <TableHead className="text-right">Monthly Rate</TableHead>
                  <TableHead>Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No rate history available
                    </TableCell>
                  </TableRow>
                ) : (
                  rateHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>
                        {new Date(history.changed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">${history.hourly_rate}</TableCell>
                      <TableCell className="text-right">${history.daily_rate}</TableCell>
                      <TableCell className="text-right">${history.weekly_rate}</TableCell>
                      <TableCell className="text-right">${history.monthly_rate}</TableCell>
                      <TableCell>{history.user_email}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsHistoryOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DIYBayRatesTab;
