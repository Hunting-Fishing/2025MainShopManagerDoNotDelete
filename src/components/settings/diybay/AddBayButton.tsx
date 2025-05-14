
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddBayButtonProps {
  onAddBay: (bayName: string) => Promise<void>;
  isSaving: boolean;
}

export const AddBayButton: React.FC<AddBayButtonProps> = ({ onAddBay, isSaving }) => {
  const [bayName, setBayName] = useState("");

  const handleAddBay = () => {
    if (bayName.trim()) {
      onAddBay(bayName.trim());
      setBayName("");
    } else {
      // Default bay name
      onAddBay(`DIY Bay ${new Date().getTime().toString().slice(-4)}`);
    }
  };

  return (
    <div className="flex gap-2 mb-6">
      <input
        type="text"
        value={bayName}
        onChange={(e) => setBayName(e.target.value)}
        placeholder="Enter bay name (optional)"
        className="px-3 py-2 border rounded-md flex-grow"
      />
      <Button onClick={handleAddBay} disabled={isSaving}>
        <Plus className="mr-1 h-4 w-4" />
        Add Bay
      </Button>
    </div>
  );
};
