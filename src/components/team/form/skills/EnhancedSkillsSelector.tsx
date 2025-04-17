
import React, { useState } from 'react';
import { Control, useController } from "react-hook-form";
import { TeamMemberFormValues } from "../formValidation";
import { SkillSearch } from './components/SkillSearch';
import { SelectedSkillBadges } from './SelectedSkillBadges';
import { CustomSkillInput } from './CustomSkillInput';
import { SkillAccordion } from './components/SkillAccordion';
import { useSkillSearch } from './hooks/useSkillSearch';

interface EnhancedSkillsSelectorProps {
  control: Control<TeamMemberFormValues>;
}

export function EnhancedSkillsSelector({ control }: EnhancedSkillsSelectorProps) {
  const [newSkill, setNewSkill] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('intermediate');

  const { field } = useController({
    name: 'skills',
    control
  });

  const {
    skillSearch,
    setSkillSearch,
    expandedCategories,
    setExpandedCategories
  } = useSkillSearch();

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

  return (
    <div className="space-y-4">
      <SkillSearch 
        value={skillSearch}
        onChange={setSkillSearch}
      />

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

      <SkillAccordion
        skillSearch={skillSearch}
        expandedCategories={expandedCategories}
        onExpandedChange={setExpandedCategories}
        isSkillSelected={isSkillSelected}
        getProficiencyForSkill={getProficiencyForSkill}
        addSkill={addSkill}
        removeSkill={removeSkill}
        selectedProficiency={selectedProficiency}
      />
    </div>
  );
}
