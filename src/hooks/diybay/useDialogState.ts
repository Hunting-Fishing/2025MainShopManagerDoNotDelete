
import { useState, useCallback } from "react";
import { Bay, RateHistory } from "@/services/diybay/diybayService";

export const useDialogState = () => {
  const [editBay, setEditBay] = useState<Bay | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const handleEditClick = useCallback((bay: Bay) => {
    setEditBay(bay);
    setIsEditDialogOpen(true);
  }, []);

  const handleHistoryClick = useCallback(
    async (bay: Bay, loadRateHistoryFn: (bayId: string) => Promise<RateHistory[]>) => {
      setSelectedBay(bay);
      await loadRateHistoryFn(bay.id);
      setIsHistoryDialogOpen(true);
    },
    []
  );

  return {
    editBay,
    isEditDialogOpen,
    selectedBay,
    isHistoryDialogOpen,
    setEditBay,
    setIsEditDialogOpen,
    setSelectedBay,
    setIsHistoryDialogOpen,
    handleEditClick,
    handleHistoryClick
  };
};
