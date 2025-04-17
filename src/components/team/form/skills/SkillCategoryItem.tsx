
import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { proficiencyLevels } from './SkillCategories';
import type { SkillCategory } from './SkillCategories';

interface SkillCategoryItemProps {
  category: SkillCategory;
  filteredSkills: string[];
  isSkillSelected: (skill: string) => boolean;
  getProficiencyForSkill: (skill: string) => string;
  addSkill: (skill: string, proficiency: string) => void;
  removeSkill: (skill: string) => void;
  selectedProficiency: string;
}

export function SkillCategoryItem({
  category,
  filteredSkills,
  isSkillSelected,
  getProficiencyForSkill,
  addSkill,
  removeSkill,
  selectedProficiency
}: SkillCategoryItemProps) {
  return (
    <AccordionItem key={category.id} value={category.id}>
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center">
          {category.icon}
          <span>{category.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredSkills.map(skill => {
            const isSelected = isSkillSelected(skill);
            const currentProficiency = getProficiencyForSkill(skill);
            
            return (
              <div key={skill} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                <div className="flex-1">
                  <span>{skill}</span>
                </div>
                
                {isSelected ? (
                  <div className="flex items-center gap-2">
                    <select 
                      className="border rounded p-1 text-xs"
                      value={currentProficiency}
                      onChange={(e) => {
                        // Remove the old entry
                        removeSkill(skill);
                        // Add with new proficiency
                        addSkill(skill, e.target.value);
                      }}
                    >
                      {proficiencyLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeSkill(skill)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7"
                    onClick={() => addSkill(skill, selectedProficiency)}
                  >
                    Add
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
