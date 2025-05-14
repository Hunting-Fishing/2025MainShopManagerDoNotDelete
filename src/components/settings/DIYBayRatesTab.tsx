
import React, { useState, useCallback } from "react";
import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { Bay } from "@/services/diybay/diybayService";
import { EditBayDialog } from "./diybay/EditBayDialog";
import { RateHistoryDialog } from "./diybay/RateHistoryDialog";
import { RateSettingsForm } from "./diybay/RateSettingsForm";
import { BaysTable } from "./diybay/BaysTable";
import { BayCard } from "./diybay/BayCard";
import { AddBayButton } from "./diybay/AddBayButton";

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
    updateBayRateSettings,
    calculateRate,
  } = useDIYBayRates();

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editBay, setEditBay] = useState<Bay | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  console.log("DIYBayRatesTab rendered with bays:", bays);

  const handleStatusChange = useCallback(async (bay: Bay, isActive: boolean) => {
    await saveBay({ ...bay, is_active: isActive });
  }, [saveBay]);

  const handleSettingsChange = useCallback((field: keyof typeof settings, value: number) => {
    // Create a new settings object with the updated field
    const updatedSettings = { ...settings, [field]: value };
    // Update the local state
    updateBayRateSettings(updatedSettings);
  }, [settings, updateBayRateSettings]);

  const handleSaveSettings = useCallback(async () => {
    await updateBayRateSettings(settings);
  }, [updateBayRateSettings, settings]);

  const handleEditClick = useCallback((bay: Bay) => {
    setEditBay(bay);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((bay: Bay) => {
    if (window.confirm(`Are you sure you want to delete ${bay.bay_name}?`)) {
      removeBay(bay.id, bay.bay_name);
    }
  }, [removeBay]);

  const handleHistoryClick = useCallback(
    async (bay: Bay) => {
      setSelectedBay(bay);
      await loadRateHistory(bay.id);
      setIsHistoryDialogOpen(true);
    },
    [loadRateHistory]
  );

  const handleAddBay = useCallback(
    async (bayName: string) => {
      console.log("Adding bay:", bayName);
      await addBay(bayName);
    },
    [addBay]
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">DIY Bay Rentals</h2>
        <p className="text-muted-foreground">
          Manage your DIY bay rental rates and availability.
        </p>
      </div>

      <RateSettingsForm
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onSaveSettings={handleSaveSettings}
        isSaving={isSaving}
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Available Bays</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "bg-muted/50" : ""}
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("cards")}
            className={viewMode === "cards" ? "bg-muted/50" : ""}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Cards
          </Button>
        </div>
      </div>

      <AddBayButton onAddBay={handleAddBay} isSaving={isSaving} />

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading bays...</p>
        </div>
      ) : (
        <>
          {bays.length === 0 ? (
            <div className="bg-muted/20 p-8 rounded-lg text-center">
              <h4 className="text-lg font-medium mb-2">No bays found</h4>
              <p className="text-muted-foreground mb-4">
                You haven't added any DIY bays yet. Add your first bay to get started.
              </p>
            </div>
          ) : viewMode === "table" ? (
            <BaysTable
              bays={bays}
              onStatusChange={handleStatusChange}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onHistoryClick={handleHistoryClick}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bays.map((bay) => (
                <BayCard
                  key={bay.id}
                  bay={bay}
                  onStatusChange={handleStatusChange}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                  onHistoryClick={handleHistoryClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      <EditBayDialog
        bay={editBay}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={saveBay}
        calculateRate={calculateRate}
        settings={settings}
        isSaving={isSaving}
      />

      <RateHistoryDialog
        bay={selectedBay}
        rateHistory={rateHistory}
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
      />
    </div>
  );
};

export default DIYBayRatesTab;
