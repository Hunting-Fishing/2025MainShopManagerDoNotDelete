
import React from 'react';
import { Factory, Car } from "lucide-react";
import { SkillItem } from './SkillItem';

interface SubCategoryProps {
  name: string;
  skills: string[];
  isSkillSelected: (skill: string) => boolean;
  getProficiencyForSkill: (skill: string) => string;
  addSkill: (skill: string, proficiency: string) => void;
  removeSkill: (skill: string) => void;
  selectedProficiency: string;
}

export const SubCategory = ({
  name,
  skills,
  isSkillSelected,
  getProficiencyForSkill,
  addSkill,
  removeSkill,
  selectedProficiency
}: SubCategoryProps) => {
  const isManufacturer = name.toLowerCase().includes('manufacturer');

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {isManufacturer ? (
          <Factory className="h-4 w-4 text-primary" />
        ) : (
          <Car className="h-4 w-4 text-primary" />
        )}
        <h4 className="text-sm font-medium text-primary">{name}</h4>
      </div>
      <div 
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(10, auto)",
        }}
      >
        {skills.map(skill => (
          <SkillItem
            key={skill}
            skill={skill}
            isSelected={isSkillSelected(skill)}
            currentProficiency={getProficiencyForSkill(skill)}
            onAdd={addSkill}
            onRemove={removeSkill}
            selectedProficiency={selectedProficiency}
          />
        ))}
      </div>
    </div>
  );
};
