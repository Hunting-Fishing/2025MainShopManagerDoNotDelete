
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
          Object.entries(category.subCategories!).map(([subCategoryKey, subCategoryData]) => {
            const skills = Array.isArray(subCategoryData) 
              ? subCategoryData 
              : 'skills' in subCategoryData 
                ? subCategoryData.skills 
                : [];

            const subCategoryName = Array.isArray(subCategoryData)
              ? formatSubCategoryName(subCategoryKey)
              : 'name' in subCategoryData
                ? subCategoryData.name
                : subCategoryKey;

            const filteredSubSkills = skills.filter(skill => 
              filteredSkills.length === 0 || filteredSkills.includes(skill)
            );

            if (filteredSubSkills.length === 0) return null;

            return (
              <div key={subCategoryKey} className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-primary">
                  {subCategoryName}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredSubSkills.map(skill => renderSkillItem(skill))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredSkills.map(skill => renderSkillItem(skill))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );

  function formatSubCategoryName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
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
                removeSkill(skill);
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
