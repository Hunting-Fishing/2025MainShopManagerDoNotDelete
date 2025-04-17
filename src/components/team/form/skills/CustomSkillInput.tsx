
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { proficiencyLevels } from './SkillCategories';

interface CustomSkillInputProps {
  newSkill: string;
  setNewSkill: (value: string) => void;
  selectedProficiency: string;
  setSelectedProficiency: (value: string) => void;
  handleAddCustomSkill: () => void;
}

export function CustomSkillInput({ 
  newSkill, 
  setNewSkill, 
  selectedProficiency, 
  setSelectedProficiency, 
  handleAddCustomSkill 
}: CustomSkillInputProps) {
  return (
    <div className="flex gap-2 items-center border rounded-md p-3 bg-muted/50">
      <Input
        placeholder="Add custom skill..."
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        className="flex-1"
      />
      <select 
        className="border rounded p-2 bg-white"
        value={selectedProficiency}
        onChange={(e) => setSelectedProficiency(e.target.value)}
      >
        {proficiencyLevels.map(level => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
      <Button 
        variant="secondary" 
        size="sm"
        onClick={handleAddCustomSkill}
        disabled={!newSkill.trim()}
      >
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>
    </div>
  );
}
