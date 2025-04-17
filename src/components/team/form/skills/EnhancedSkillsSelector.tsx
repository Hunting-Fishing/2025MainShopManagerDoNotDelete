
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

  // Current skills from the form field
  const selectedSkills = field.value || [];

  // Check if a skill is selected
  const isSkillSelected = (skill: string) => {
    return selectedSkills.some((s: string) => s.startsWith(`${skill}|`));
  };

  // Get proficiency for a selected skill
  const getProficiencyForSkill = (skill: string) => {
    const found = selectedSkills.find((s: string) => s.startsWith(`${skill}|`));
    return found ? found.split('|')[1] : 'intermediate';
  };

  // Add a skill with proficiency
  const addSkill = (skill: string, proficiency: string) => {
    const updatedSkills = [...selectedSkills, `${skill}|${proficiency}`];
    field.onChange(updatedSkills);
  };

  // Remove a skill
  const removeSkill = (skill: string) => {
    const updatedSkills = selectedSkills.filter(
      (s: string) => !s.startsWith(`${skill}|`)
    );
    field.onChange(updatedSkills);
  };

  // Add a custom skill
  const handleAddCustomSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill.trim(), selectedProficiency);
      setNewSkill('');
    }
  };

  // Filter skills based on search
  const getFilteredSkills = (categorySkills: string[]) => {
    if (!skillSearch) return categorySkills;
    
    return categorySkills.filter(skill => 
      skill.toLowerCase().includes(skillSearch.toLowerCase())
    );
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search skills..."
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
          className="pl-10"
        />
        <Wrench className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>

      {/* Selected skills display */}
      <div className="border rounded-lg p-3 bg-slate-50">
        <h3 className="text-sm font-medium mb-2">Selected Skills:</h3>
        <SelectedSkillBadges 
          selectedSkills={selectedSkills} 
          removeSkill={removeSkill} 
        />
      </div>

      {/* Add custom skill input */}
      <CustomSkillInput 
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        selectedProficiency={selectedProficiency}
        setSelectedProficiency={setSelectedProficiency}
        handleAddCustomSkill={handleAddCustomSkill}
      />

      {/* Skills categories accordion */}
      <Accordion type="single" collapsible className="w-full">
        {skillCategories.map(category => {
          const filteredSkills = getFilteredSkills(category.skills);
          
          // Skip empty categories when filtering
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
  );
}
