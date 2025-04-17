
import React from 'react';
import { Accordion } from "@/components/ui/accordion";
import { SkillCategoryItem } from '../SkillCategoryItem';
import { skillCategories } from '../SkillCategories';
import type { SkillCategory } from '../SkillCategories';

interface SkillAccordionProps {
  skillSearch: string;
  expandedCategories: string[];
  onExpandedChange: (value: string[]) => void;
  isSkillSelected: (skill: string) => boolean;
  getProficiencyForSkill: (skill: string) => string;
  addSkill: (skill: string, proficiency: string) => void;
  removeSkill: (skill: string) => void;
  selectedProficiency: string;
}

export function SkillAccordion({
  skillSearch,
  expandedCategories,
  onExpandedChange,
  isSkillSelected,
  getProficiencyForSkill,
  addSkill,
  removeSkill,
  selectedProficiency
}: SkillAccordionProps) {
  const getFilteredSkills = (category: SkillCategory) => {
    if (!skillSearch) return [];
    
    const searchLower = skillSearch.toLowerCase();
    const mainSkills = category.skills.filter(skill => 
      skill.toLowerCase().includes(searchLower)
    );
    
    if (!category.subCategories) return mainSkills;
    
    const subCategorySkills = Object.values(category.subCategories)
      .flatMap(subCategory => {
        if (Array.isArray(subCategory)) {
          return subCategory;
        } else if (typeof subCategory === 'object' && subCategory !== null && 'skills' in subCategory) {
          return subCategory.skills;
        }
        return [];
      })
      .filter(skill => skill.toLowerCase().includes(searchLower));
    
    return [...new Set([...mainSkills, ...subCategorySkills])];
  };

  return (
    <div className="max-h-[600px] overflow-y-auto">
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        onValueChange={onExpandedChange}
        className="w-full"
      >
        {skillCategories.map(category => {
          const filteredSkills = getFilteredSkills(category);
          
          const shouldHideCategory = skillSearch && filteredSkills.length === 0 && 
            (!category.subCategories || Object.values(category.subCategories).every(subCat => {
              if (Array.isArray(subCat)) {
                return !subCat.some(skill => skill.toLowerCase().includes(skillSearch.toLowerCase()));
              } else if (typeof subCat === 'object' && subCat !== null && 'skills' in subCat) {
                return !subCat.skills.some(skill => skill.toLowerCase().includes(skillSearch.toLowerCase()));
              }
              return true;
            }));
          
          if (shouldHideCategory) return null;
          
          return (
            <SkillCategoryItem
              key={category.id}
              category={category}
              filteredSkills={filteredSkills}
              isSkillSelected={isSkillSelected}
              getProficiencyForSkill={getProficiencyForSkill}
              addSkill={addSkill}
              removeSkill={removeSkill}
              selectedProficiency={selectedProficiency}
            />
          );
        })}
      </Accordion>
    </div>
  );
}
