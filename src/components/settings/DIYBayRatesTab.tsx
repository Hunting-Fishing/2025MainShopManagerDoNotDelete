
import React, { useState, useCallback } from "react";
import { useDIYBayRates } from "@/hooks/useDIYBayRates";
import { Bay } from "@/services/diybay/diybayService";
import { DIYBayHeader } from "./diybay/DIYBayHeader";
import { RateSettingsForm } from "./diybay/RateSettingsForm";
import { BaySection } from "./diybay/BaySection";
import { DIYBayDialogs } from "./diybay/DIYBayDialogs";
import { useDialogState } from "@/hooks/diybay/useDialogState";

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
  
  const {
    editBay,
    isEditDialogOpen,
    selectedBay,
    isHistoryDialogOpen,
    setIsEditDialogOpen,
    setIsHistoryDialogOpen,
    handleEditClick,
    handleHistoryClick
  } = useDialogState();

  const handleStatusChange = useCallback(async (bay: Bay, isActive: boolean) => {
    await saveBay({ ...bay, is_active: isActive });
  }, [saveBay]);

  const handleRateChange = useCallback(async (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => {
    await saveBay({ ...bay, [field]: value });
  }, [saveBay]);

  const handleSettingsChange = useCallback((field: keyof typeof settings, value: number) => {
    const updatedSettings = { ...settings, [field]: value };
    updateBayRateSettings(updatedSettings);
  }, [settings, updateBayRateSettings]);

  const handleSaveSettings = useCallback(async () => {
    return await updateBayRateSettings(settings);
  }, [updateBayRateSettings, settings]);

  const handleDeleteClick = useCallback((bay: Bay) => {
    if (window.confirm(`Are you sure you want to delete ${bay.bay_name}?`)) {
      removeBay(bay.id, bay.bay_name);
    }
  }, [removeBay]);

  const handleHistoryClickWithLoad = useCallback(
    async (bay: Bay) => {
      await handleHistoryClick(bay, loadRateHistory);
    },
    [handleHistoryClick, loadRateHistory]
  );

  const handleAddBay = useCallback(
    async (bayName: string) => {
      console.log("Adding bay:", bayName);
      return await addBay(bayName);
    },
    [addBay]
  );

  // This wrapper function ensures saveBay returns a Promise<boolean> like the original,
  // but satisfies the EditBayDialog's onSave prop type
  const handleSaveBay = useCallback(
    async (bay: Bay): Promise<boolean> => {
      try {
        return await saveBay(bay);
      } catch (error) {
        console.error("Error saving bay:", error);
        return false;
      }
    },
    [saveBay]
  );

  return (
    <div>
      <DIYBayHeader />

      <RateSettingsForm
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onSaveSettings={handleSaveSettings}
        isSaving={isSaving}
      />

      <BaySection 
        bays={bays}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isLoading={isLoading}
        isSaving={isSaving}
        onStatusChange={handleStatusChange}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onHistoryClick={handleHistoryClickWithLoad}
        onAddBay={handleAddBay}
        onRateChange={handleRateChange}
      />

      <DIYBayDialogs 
        editBay={editBay}
        isEditDialogOpen={isEditDialogOpen}
        onCloseEditDialog={() => setIsEditDialogOpen(false)}
        onSaveBay={handleSaveBay}
        calculateRate={calculateRate}
        settings={settings}
        isSaving={isSaving}
        selectedBay={selectedBay}
        rateHistory={rateHistory}
        isHistoryDialogOpen={isHistoryDialogOpen}
        onCloseHistoryDialog={() => setIsHistoryDialogOpen(false)}
      />
    </div>
  );
};

export default DIYBayRatesTab;
