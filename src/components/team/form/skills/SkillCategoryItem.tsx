
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
  const hasSubCategories = category.subCategories && Object.keys(category.subCategories).length > 0;

  return (
    <AccordionItem key={category.id} value={category.id}>
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center">
          {category.icon}
          <span>{category.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2 pb-4">
        {hasSubCategories ? (
          // Render skills organized by subcategories
          Object.entries(category.subCategories!).map(([subCategoryKey, subCategorySkills]) => (
            <div key={subCategoryKey} className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-primary">
                {formatSubCategoryName(subCategoryKey)}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subCategorySkills
                  .filter(skill => 
                    !filteredSkills.length || 
                    filteredSkills.includes(skill)
                  )
                  .map(skill => renderSkillItem(skill))}
              </div>
            </div>
          ))
        ) : (
          // Render skills without subcategories
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredSkills.map(skill => renderSkillItem(skill))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );

  function formatSubCategoryName(key: string): string {
    // Convert camelCase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([A-Z]) ([A-Z])/g, '$1$2'); // Fix adjacent capitals like "R V" to "RV"
  }

  function renderSkillItem(skill: string) {
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
  }
}
