
import React, { useState, useEffect } from 'react';
import { Control, useFormContext, useWatch } from "react-hook-form";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TeamMemberFormValues } from "../formValidation";
import { Button } from "@/components/ui/button";
import { Wrench, Zap, Clipboard, PenTool, Search, X, Plus } from "lucide-react";

// Define the skill categories
const skillCategories = [
  {
    id: 'mechanical',
    name: 'Mechanical Systems',
    icon: <Wrench className="h-4 w-4 mr-2" />,
    skills: [
      'Engine Repair',
      'Cooling System',
      'Fuel System',
      'Drivetrain',
      'Transmission',
      'Brakes',
      'Suspension'
    ].sort()
  },
  {
    id: 'electrical',
    name: 'Electrical Systems',
    icon: <Zap className="h-4 w-4 mr-2" />,
    skills: [
      'Diagnostics',
      'ECU Programming',
      'Hybrid/EV Systems',
      'ADAS Calibration',
      'Wiring',
      'Battery Systems'
    ].sort()
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Service',
    icon: <Clipboard className="h-4 w-4 mr-2" />,
    skills: [
      'Oil Changes',
      'Tire Rotation',
      'Tire Balancing',
      'Brake Service',
      'Fluid Flushes',
      'Tune-ups',
      'Inspections'
    ].sort()
  },
  {
    id: 'custom',
    name: 'Performance & Custom Work',
    icon: <PenTool className="h-4 w-4 mr-2" />,
    skills: [
      'Exhaust Modifications',
      'Suspension Lifts',
      'Tuning & Reprogramming',
      'Performance Upgrades',
      'Custom Fabrication'
    ].sort()
  }
];

// Proficiency levels
const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

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

  // Sort skills alphabetically for display
  const sortedSelectedSkills = [...selectedSkills].sort((a: string, b: string) => {
    const skillA = a.split('|')[0];
    const skillB = b.split('|')[0];
    return skillA.localeCompare(skillB);
  });

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
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {sortedSelectedSkills.map((skillItem: string) => {
          const [skill, proficiency] = skillItem.split('|');
          let badgeColor = "bg-blue-100 text-blue-800";
          
          if (proficiency === 'beginner') {
            badgeColor = "bg-gray-100 text-gray-800";
          } else if (proficiency === 'expert') {
            badgeColor = "bg-green-100 text-green-800";
          }
          
          // Check if it's a custom skill (not in any category)
          const isCustomSkill = !skillCategories.some(category => 
            category.skills.includes(skill)
          );
          
          return (
            <Badge 
              key={skill} 
              className={`${isCustomSkill ? 'bg-purple-100 text-purple-800' : badgeColor} px-2 py-1 flex items-center`}
            >
              {skill}
              <span className="ml-2 text-xs">({proficiency})</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 h-4 w-4 p-0" 
                onClick={() => removeSkill(skill)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>

      {/* Add custom skill */}
      <div className="flex gap-2 items-center border rounded-md p-3 bg-muted/50">
        <Input
          placeholder="Add custom skill..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          className="flex-1"
        />
        <select 
          className="border rounded p-2 bg-white"
          value={selectedProficiency}
          onChange={(e) => setSelectedProficiency(e.target.value)}
        >
          {proficiencyLevels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={handleAddCustomSkill}
          disabled={!newSkill.trim()}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Skill categories */}
      <Accordion 
        type="multiple" 
        defaultValue={['mechanical']}
        className="border rounded-md"
        value={expandedCategories}
      >
        {skillCategories.map(category => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger 
              className="px-4 hover:no-underline"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                {category.icon}
                <span>{category.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getFilteredSkills(category.skills).map(skill => {
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
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
