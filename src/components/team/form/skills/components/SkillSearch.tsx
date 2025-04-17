
import React from 'react';
import { Input } from "@/components/ui/input";
import { Wrench } from "lucide-react";

interface SkillSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SkillSearch({ value, onChange }: SkillSearchProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search skills or vehicle models..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
      <Wrench className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
    </div>
  );
}
