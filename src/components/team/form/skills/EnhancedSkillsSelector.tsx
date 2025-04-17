
import React, { useState, useEffect } from 'react';
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Control, useController } from "react-hook-form";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { skillCategories } from './SkillCategories';
import { Wrench } from 'lucide-react';
import { SkillCategoryItem } from './SkillCategoryItem';
import { SelectedSkillBadges } from './SelectedSkillBadges';
import { CustomSkillInput } from './CustomSkillInput';

interface EnhancedSkillsSelectorProps {
  control: Control<TeamMemberFormValues>;
}

export function EnhancedSkillsSelector({ control }: EnhancedSkillsSelectorProps) {
  const [skillSearch, setSkillSearch] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('intermediate');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const { field } = useController({
    name: 'skills',
    control
  });

  const selectedSkills = field.value || [];

  // Auto-expand categories that have matching skills when searching
  useEffect(() => {
    if (skillSearch) {
      const matchingCategories = skillCategories
        .filter(category => {
          // Check if any skills in the category match the search
          const categoryMatches = category.skills.some(skill => 
            skill.toLowerCase().includes(skillSearch.toLowerCase())
          );
          
          // Also check skills in subcategories
          const subCategoryMatches = category.subCategories ? 
            Object.values(category.subCategories).some(subCategory => {
              if (Array.isArray(subCategory)) {
                return subCategory.some(skill => 
                  skill.toLowerCase().includes(skillSearch.toLowerCase())
                );
              } else if ('skills' in subCategory) {
                return subCategory.skills.some(skill => 
                  skill.toLowerCase().includes(skillSearch.toLowerCase())
                );
              }
              return false;
            }) : false;
            
          return categoryMatches || subCategoryMatches;
        })
        .map(category => category.id);
      
      // Add matching categories to expanded list if not already there
      setExpandedCategories(prev => {
        const newExpanded = [...prev];
        matchingCategories.forEach(id => {
          if (!newExpanded.includes(id)) {
            newExpanded.push(id);
          }
        });
        return newExpanded;
      });
    }
  }, [skillSearch]);

  const isSkillSelected = (skill: string) => {
    return selectedSkills.some((s: string) => s.startsWith(`${skill}|`));
  };

  const getProficiencyForSkill = (skill: string) => {
    const found = selectedSkills.find((s: string) => s.startsWith(`${skill}|`));
    return found ? found.split('|')[1] : 'intermediate';
  };

  const addSkill = (skill: string, proficiency: string) => {
    const updatedSkills = [...selectedSkills, `${skill}|${proficiency}`];
    field.onChange(updatedSkills);
  };

  const removeSkill = (skill: string) => {
    const updatedSkills = selectedSkills.filter(
      (s: string) => !s.startsWith(`${skill}|`)
    );
    field.onChange(updatedSkills);
  };

  const handleAddCustomSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill.trim(), selectedProficiency);
      setNewSkill('');
    }
  };

  const getFilteredSkills = (categorySkills: string[]) => {
    if (!skillSearch) return categorySkills;
    
    const searchLower = skillSearch.toLowerCase();
    return categorySkills.filter(skill => 
      skill.toLowerCase().includes(searchLower)
    );
  };

  const handleAccordionChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      setExpandedCategories(value);
    } else {
      if (expandedCategories.includes(value)) {
        setExpandedCategories(expandedCategories.filter(id => id !== value));
      } else {
        setExpandedCategories([...expandedCategories, value]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search skills or vehicle models..."
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
          className="pl-10"
        />
        <Wrench className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>

      <div className="border rounded-lg p-3 bg-slate-50">
        <h3 className="text-sm font-medium mb-2">Selected Skills & Vehicles:</h3>
        <SelectedSkillBadges 
          selectedSkills={selectedSkills} 
          removeSkill={removeSkill} 
        />
      </div>

      <CustomSkillInput 
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        selectedProficiency={selectedProficiency}
        setSelectedProficiency={setSelectedProficiency}
        handleAddCustomSkill={handleAddCustomSkill}
      />

      <div className="max-h-[600px] overflow-y-auto">
        <Accordion 
          type="multiple" 
          value={expandedCategories}
          onValueChange={handleAccordionChange}
          className="w-full"
        >
          {skillCategories.map(category => {
            const filteredSkills = getFilteredSkills(category.skills);
            
            // Only hide categories when actively searching and no results found
            const shouldHideCategory = skillSearch && filteredSkills.length === 0 && 
              // Also check subcategories when searching
              (!category.subCategories || Object.values(category.subCategories).every(subCat => {
                if (Array.isArray(subCat)) {
                  return !subCat.some(skill => skill.toLowerCase().includes(skillSearch.toLowerCase()));
                } else if ('skills' in subCat) {
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
    </div>
  );
}
