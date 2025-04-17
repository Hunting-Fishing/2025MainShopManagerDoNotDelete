
import React, { useState } from 'react';
import { Control, useFormContext, useWatch } from "react-hook-form";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { TeamMemberFormValues } from "../formValidation";
import { Search } from "lucide-react";
import { skillCategories, proficiencyLevels } from './SkillCategories';
import { SelectedSkillBadges } from './SelectedSkillBadges';
import { CustomSkillInput } from './CustomSkillInput';
import { SkillCategoryItem } from './SkillCategoryItem';

interface EnhancedSkillsSelectorProps {
  control: Control<TeamMemberFormValues>;
}

export function EnhancedSkillsSelector({ control }: EnhancedSkillsSelectorProps) {
  const { setValue } = useFormContext<TeamMemberFormValues>();
  const selectedSkills = useWatch({
    control,
    name: 'skills',
    defaultValue: []
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('intermediate');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['mechanical']);

  // Helper to check if a skill is already selected
  const isSkillSelected = (skill: string) => {
    return selectedSkills.some((selected: string) => 
      selected.split('|')[0] === skill
    );
  };

  // Get the proficiency level for a selected skill
  const getProficiencyForSkill = (skill: string) => {
    const found = selectedSkills.find((selected: string) => 
      selected.split('|')[0] === skill
    );
    return found ? found.split('|')[1] || 'intermediate' : 'intermediate';
  };

  // Add a skill with proficiency
  const addSkill = (skill: string, proficiency: string) => {
    // Check if it already exists
    if (!isSkillSelected(skill)) {
      const newValue = [...selectedSkills, `${skill}|${proficiency}`];
      setValue('skills', newValue);
    }
  };

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = selectedSkills.filter((skillItem: string) => {
      const [skill] = skillItem.split('|');
      return skill !== skillToRemove;
    });
    setValue('skills', updatedSkills);
  };

  // Handle adding a custom skill
  const handleAddCustomSkill = () => {
    if (newSkill.trim() && !isSkillSelected(newSkill.trim())) {
      addSkill(newSkill.trim(), selectedProficiency);
      setNewSkill('');
    }
  };

  // Filter skills based on search query
  const getFilteredSkills = (skills: string[]) => {
    if (!searchQuery) return skills;
    return skills.filter(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Handle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(current => 
      current.includes(categoryId) 
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        <Input 
          className="pl-10"
          placeholder="Search skills..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Selected skills display */}
      <SelectedSkillBadges 
        selectedSkills={selectedSkills} 
        removeSkill={removeSkill} 
      />

      {/* Add custom skill */}
      <CustomSkillInput 
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        selectedProficiency={selectedProficiency}
        setSelectedProficiency={setSelectedProficiency}
        handleAddCustomSkill={handleAddCustomSkill}
      />

      {/* Skill categories */}
      <Accordion 
        type="multiple" 
        defaultValue={['mechanical']}
        className="border rounded-md"
        value={expandedCategories}
      >
        {skillCategories.map(category => (
          <SkillCategoryItem 
            key={category.id}
            category={category}
            filteredSkills={getFilteredSkills(category.skills)}
            isSkillSelected={isSkillSelected}
            getProficiencyForSkill={getProficiencyForSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
            selectedProficiency={selectedProficiency}
          />
        ))}
      </Accordion>
    </div>
  );
}
