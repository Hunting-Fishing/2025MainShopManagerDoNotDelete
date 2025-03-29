
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SaveButtonProps {
  saveStatus: "idle" | "saved" | "changed";
  onSave: () => void;
}

export function SaveButton({ saveStatus, onSave }: SaveButtonProps) {
  if (saveStatus === "idle") {
    return null;
  }

  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave} 
        disabled={saveStatus === "saved"}
        className="w-24"
      >
        {saveStatus === "saved" ? (
          <>
            <Check className="mr-2 h-4 w-4" /> 
            Saved
          </>
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
}
