import React, { useState } from 'react';
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

  const { field } = useController({
    name: 'skills',
    control
  });

  const selectedSkills = field.value || [];

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
        <Accordion type="single" collapsible className="w-full">
          {skillCategories.map(category => {
            const filteredSkills = getFilteredSkills(category.skills);
            
            if (skillSearch && filteredSkills.length === 0) return null;
            
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
