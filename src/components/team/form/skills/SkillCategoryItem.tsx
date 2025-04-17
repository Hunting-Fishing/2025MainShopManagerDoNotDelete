
import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Car, Factory, X } from "lucide-react";
import { proficiencyLevels } from './SkillCategories';
import type { SkillCategory } from './SkillCategories';
import { cn } from "@/lib/utils";

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
  
  const renderManufacturerBadge = (skill: string): React.ReactNode => {
    const hasFlag = /^\p{Emoji_Presentation}\s/u.test(skill) || /^\p{Regional_Indicator}\p{Regional_Indicator}\s/u.test(skill);
    if (!hasFlag) return skill;

    const parts = skill.split(' ');
    const flag = parts[0];
    const name = parts.slice(1).join(' ');
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{flag}</span>
        <span>{name}</span>
      </div>
    );
  };

  const formatSubCategoryName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const renderSkillItem = (skill: string) => {
    const isSelected = isSkillSelected(skill);
    const currentProficiency = getProficiencyForSkill(skill);
    
    const hasFlag = skill.match(/^\S+\s/) && /\p{Emoji}/u.test(skill.split(' ')[0]);
    
    return (
      <div 
        key={skill} 
        className={cn(
          "flex items-center justify-between p-2 border rounded",
          "hover:bg-gray-50 transition-colors duration-200",
          hasFlag && "bg-slate-50"
        )}
      >
        <div className="flex-1">
          {renderManufacturerBadge(skill)}
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
  };

  return (
    <AccordionItem value={category.id} data-testid={`category-${category.id}`}>
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          {category.icon}
          <span>{category.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2 pb-4">
        {hasSubCategories ? (
          Object.entries(category.subCategories!).map(([subCategoryKey, subCategoryData]) => {
            let displayName = formatSubCategoryName(subCategoryKey);
            let subCategorySkills: string[] = [];
            
            if (Array.isArray(subCategoryData)) {
              subCategorySkills = subCategoryData;
            } else if (typeof subCategoryData === 'object' && subCategoryData !== null) {
              if ('name' in subCategoryData && typeof subCategoryData.name === 'string') {
                displayName = subCategoryData.name;
              }
              if ('skills' in subCategoryData && Array.isArray(subCategoryData.skills)) {
                subCategorySkills = subCategoryData.skills;
              }
            }
            
            const filteredSubSkills = filteredSkills.length === 0 
              ? subCategorySkills 
              : subCategorySkills.filter(skill => filteredSkills.includes(skill));
            
            if (filteredSubSkills.length === 0) return null;
            
            return (
              <div key={subCategoryKey} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {subCategoryKey.toLowerCase().includes('manufacturer') ? (
                    <Factory className="h-4 w-4 text-primary" />
                  ) : (
                    <Car className="h-4 w-4 text-primary" />
                  )}
                  <h4 className="text-sm font-medium text-primary">
                    {displayName}
                  </h4>
                </div>
                <div 
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gridAutoFlow: "column",
                    gridTemplateRows: "repeat(10, auto)",
                  }}
                >
                  {filteredSubSkills.map(skill => renderSkillItem(skill))}
                </div>
              </div>
            );
          })
        ) : (
          <div 
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gridAutoFlow: "column",
              gridTemplateRows: "repeat(10, auto)",
            }}
          >
            {filteredSkills.length > 0 
              ? filteredSkills.map(skill => renderSkillItem(skill))
              : category.skills.map(skill => renderSkillItem(skill))
            }
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
