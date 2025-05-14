
import React, { useState } from "react";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pencil, Save, Plus, HistoryIcon, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function DIYBayRatesTab() {
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
    calculateRate
  } = useDIYBayRates();

  const [editingBayId, setEditingBayId] = useState<string | null>(null);
  const [bayInputs, setBayInputs] = useState<{ [key: string]: any }>({});
  const [isAddingBay, setIsAddingBay] = useState(false);
  const [newBayName, setNewBayName] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);

  // Initialize or update edited values when editingBayId changes
  React.useEffect(() => {
    if (editingBayId) {
      const bay = bays.find((b) => b.id === editingBayId);
      if (bay) {
        setBayInputs({
          ...bay
        });
      }
    } else {
      setBayInputs({});
    }
  }, [editingBayId, bays]);

  const handleInputChange = (
    bayId: string,
    field: string,
    value: string | number | boolean
  ) => {
    setBayInputs((prev) => ({
      ...prev,
      [field]: field === "hourly_rate" ? parseFloat(value as string) || 0 : value,
    }));

    // If changing hourly rate, auto-calculate other rates
    if (field === "hourly_rate" && settings) {
      const hourlyRate = parseFloat(value as string) || 0;
      setBayInputs((prev) => ({
        ...prev,
        daily_rate: calculateRate('daily', hourlyRate),
        weekly_rate: calculateRate('weekly', hourlyRate),
        monthly_rate: calculateRate('monthly', hourlyRate)
      }));
    }
  };

  const handleSave = async (bayId: string) => {
    const bayToUpdate = bays.find((b) => b.id === bayId);
    if (bayToUpdate && bayInputs) {
      const updatedBay = {
        ...bayToUpdate,
        ...bayInputs
      };
      
      const success = await saveBay(updatedBay);
      if (success) {
        setEditingBayId(null);
      }
    }
  };

  const handleAddBay = async () => {
    if (newBayName.trim()) {
      const newBay = await addBay(newBayName);
      if (newBay) {
        setNewBayName("");
        setIsAddingBay(false);
      }
    }
  };

  const handleRemoveBay = async (bayId: string, bayName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${bayName}?`);
    if (confirmed) {
      const success = await removeBay(bayId, bayName);
      if (success && editingBayId === bayId) {
        setEditingBayId(null);
      }
    }
  };

  const handleViewHistory = async (bayId: string) => {
    await loadRateHistory(bayId);
    setSelectedBayId(bayId);
    setHistoryOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getSelectedBayName = () => {
    if (!selectedBayId) return "";
    const bay = bays.find(b => b.id === selectedBayId);
    return bay ? bay.bay_name : "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DIY Bay Rates</CardTitle>
          <CardDescription>
            Manage your self-service bay rental rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button
              onClick={() => setIsAddingBay(true)}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Bay
            </Button>
          </div>

          {isAddingBay && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Bay Name"
                  value={newBayName}
                  onChange={(e) => setNewBayName(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  onClick={handleAddBay}
                  disabled={!newBayName.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingBay(false);
                    setNewBayName("");
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Bay Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Hourly Rate ($)</TableHead>
                  <TableHead>Daily Rate ($)</TableHead>
                  <TableHead>Weekly Rate ($)</TableHead>
                  <TableHead>Monthly Rate ($)</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No bays found. Add your first bay to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  bays.map((bay) => (
                    <TableRow key={bay.id}>
                      <TableCell>
                        {editingBayId === bay.id ? (
                          <Input
                            value={bayInputs.bay_name || ''}
                            onChange={(e) =>
                              handleInputChange(bay.id, "bay_name", e.target.value)
                            }
                          />
                        ) : (
                          bay.bay_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBayId === bay.id ? (
                          <Input
                            value={bayInputs.bay_location || ''}
                            onChange={(e) =>
                              handleInputChange(bay.id, "bay_location", e.target.value)
                            }
                          />
                        ) : (
                          bay.bay_location || "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBayId === bay.id ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={bayInputs.hourly_rate}
                            onChange={(e) =>
                              handleInputChange(bay.id, "hourly_rate", e.target.value)
                            }
                          />
                        ) : (
                          bay.hourly_rate?.toFixed(2)
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBayId === bay.id ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={bayInputs.daily_rate}
                            onChange={(e) =>
                              handleInputChange(bay.id, "daily_rate", e.target.value)
                            }
                            disabled={true}
                          />
                        ) : (
                          bay.daily_rate?.toFixed(2) || "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBayId === bay.id ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={bayInputs.weekly_rate}
                            onChange={(e) =>
                              handleInputChange(bay.id, "weekly_rate", e.target.value)
                            }
                            disabled={true}
                          />
                        ) : (
                          bay.weekly_rate?.toFixed(2) || "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBayId === bay.id ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={bayInputs.monthly_rate}
                            onChange={(e) =>
                              handleInputChange(bay.id, "monthly_rate", e.target.value)
                            }
                            disabled={true}
                          />
                        ) : (
                          bay.monthly_rate?.toFixed(2) || "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBayId === bay.id ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={bayInputs.is_active || false}
                              onCheckedChange={(checked) =>
                                handleInputChange(bay.id, "is_active", checked)
                              }
                            />
                            <Label>{bayInputs.is_active ? "Yes" : "No"}</Label>
                          </div>
                        ) : (
                          bay.is_active ? "Yes" : "No"
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editingBayId === bay.id ? (
                          <>
                            <Button
                              onClick={() => handleSave(bay.id)}
                              size="sm"
                              disabled={isSaving}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              onClick={() => setEditingBayId(null)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => setEditingBayId(bay.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleViewHistory(bay.id)}
                              variant="outline"
                              size="sm"
                            >
                              <HistoryIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleRemoveBay(bay.id, bay.bay_name)}
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Change History for {getSelectedBayName()}</DialogTitle>
            <DialogDescription>
              View historical rate changes for this bay
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hourly</TableHead>
                  <TableHead>Daily</TableHead>
                  <TableHead>Weekly</TableHead>
                  <TableHead>Monthly</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No history found
                    </TableCell>
                  </TableRow>
                ) : (
                  rateHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.changed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${entry.hourly_rate?.toFixed(2)}</TableCell>
                      <TableCell>
                        ${entry.daily_rate?.toFixed(2) || "-"}
                      </TableCell>
                      <TableCell>
                        ${entry.weekly_rate?.toFixed(2) || "-"}
                      </TableCell>
                      <TableCell>
                        ${entry.monthly_rate?.toFixed(2) || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button onClick={() => setHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
