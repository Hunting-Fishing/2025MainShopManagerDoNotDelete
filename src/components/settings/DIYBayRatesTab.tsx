
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, History } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Bay, RateHistory } from "@/services/diybay/diybayService";

export const DIYBayRatesTab: React.FC = () => {
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
    calculateRate,
  } = useDIYBayRates();

  const [editingBay, setEditingBay] = useState<Bay | null>(null);
  const [newBayName, setNewBayName] = useState("");
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddBay = async () => {
    if (newBayName.trim()) {
      await addBay(newBayName);
      setNewBayName("");
    } else {
      toast({
        title: "Bay name required",
        description: "Please enter a name for the new bay.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBay = async (bay: Bay) => {
    if (bay.hourly_rate <= 0) {
      toast({
        title: "Invalid rate",
        description: "Hourly rate must be greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    await saveBay(bay);
    setEditingBay(null);
  };

  const handleRemoveBay = async (bayId: string, bayName: string) => {
    if (window.confirm(`Are you sure you want to remove ${bayName}?`)) {
      await removeBay(bayId, bayName);
    }
  };

  const handleViewHistory = async (bayId: string) => {
    setSelectedBayId(bayId);
    await loadRateHistory(bayId);
    setShowHistoryDialog(true);
  };

  const handleRateChange = (bay: Bay, value: string) => {
    const hourlyRate = parseFloat(value) || 0;
    
    setEditingBay({
      ...bay,
      hourly_rate: hourlyRate,
      daily_rate: calculateRate('daily', hourlyRate),
      weekly_rate: calculateRate('weekly', hourlyRate),
      monthly_rate: calculateRate('monthly', hourlyRate)
    });
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0.00";
    return `$${value.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">DIY Bay Rates</h3>
        <div className="flex space-x-2">
          <Input
            value={newBayName}
            onChange={(e) => setNewBayName(e.target.value)}
            placeholder="New Bay Name"
            className="w-64"
          />
          <Button 
            onClick={handleAddBay} 
            disabled={isSaving || !newBayName.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Bay
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bays.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No bays have been configured yet. Add your first bay to get started.
            </CardContent>
          </Card>
        ) : (
          bays.map((bay) => (
            <Card key={bay.id} className="overflow-hidden border border-gray-100 shadow-md rounded-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
                <CardTitle className="flex justify-between items-center">
                  <span className="truncate">{bay.bay_name}</span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewHistory(bay.id)}
                      className="text-white hover:text-white hover:bg-indigo-600"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveBay(bay.id, bay.bay_name)}
                      className="text-white hover:text-white hover:bg-indigo-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                {bay.bay_location && (
                  <div className="text-sm opacity-90 mt-1">{bay.bay_location}</div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hourly Rate</label>
                      {editingBay?.id === bay.id ? (
                        <Input
                          type="number"
                          value={editingBay.hourly_rate}
                          onChange={(e) => handleRateChange(bay, e.target.value)}
                          className="mt-1"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div className="text-xl font-bold mt-1 text-green-600">
                          {formatCurrency(bay.hourly_rate)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Daily Rate</label>
                      <div className="text-lg font-semibold mt-1">
                        {formatCurrency(editingBay?.id === bay.id ? editingBay.daily_rate : bay.daily_rate)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Weekly Rate</label>
                      <div className="text-lg font-semibold mt-1">
                        {formatCurrency(editingBay?.id === bay.id ? editingBay.weekly_rate : bay.weekly_rate)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Monthly Rate</label>
                      <div className="text-lg font-semibold mt-1">
                        {formatCurrency(editingBay?.id === bay.id ? editingBay.monthly_rate : bay.monthly_rate)}
                      </div>
                    </div>
                  </div>
                  {editingBay?.id === bay.id ? (
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingBay(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleSaveBay(editingBay)}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => setEditingBay({...bay})}
                    >
                      Edit Rates
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rate History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rate History</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Hourly</th>
                  <th className="text-left py-2">Daily</th>
                  <th className="text-left py-2">Weekly</th>
                  <th className="text-left py-2">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {rateHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No rate history available
                    </td>
                  </tr>
                ) : (
                  rateHistory.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="py-2">
                        {new Date(entry.changed_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">{formatCurrency(entry.hourly_rate)}</td>
                      <td className="py-2">{formatCurrency(entry.daily_rate)}</td>
                      <td className="py-2">{formatCurrency(entry.weekly_rate)}</td>
                      <td className="py-2">{formatCurrency(entry.monthly_rate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
