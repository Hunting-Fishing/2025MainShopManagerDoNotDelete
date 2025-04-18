
import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { SkillCategory } from './SkillCategories';
import { SubCategory } from './components/SubCategory';
import { SkillItem } from './components/SkillItem';
import { SkillsErrorBoundary } from './components/SkillsErrorBoundary';

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

  const formatSubCategoryName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
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
        <SkillsErrorBoundary>
          {hasSubCategories ? (
            Object.entries(category.subCategories!).map(([subCategoryKey, subCategoryData]) => {
              const displayName = formatSubCategoryName(subCategoryKey);
              const subCategorySkills = Array.isArray(subCategoryData) 
                ? subCategoryData 
                : subCategoryData.skills;

              const filteredSubSkills = filteredSkills.length === 0 
                ? subCategorySkills 
                : subCategorySkills.filter(skill => filteredSkills.includes(skill));

              if (filteredSubSkills.length === 0) return null;

              return (
                <SubCategory
                  key={subCategoryKey}
                  name={displayName}
                  skills={filteredSubSkills}
                  isSkillSelected={isSkillSelected}
                  getProficiencyForSkill={getProficiencyForSkill}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                  selectedProficiency={selectedProficiency}
                />
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
              {(filteredSkills.length > 0 
                ? filteredSkills
                : category.skills
              ).map(skill => (
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
          )}
        </SkillsErrorBoundary>
      </AccordionContent>
    </AccordionItem>
  );
}
