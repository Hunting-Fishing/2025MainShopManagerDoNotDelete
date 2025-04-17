
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { skillCategories } from './SkillCategories';

interface SelectedSkillBadgesProps {
  selectedSkills: string[];
  removeSkill: (skill: string) => void;
}

export function SelectedSkillBadges({ selectedSkills, removeSkill }: SelectedSkillBadgesProps) {
  // Sort skills alphabetically for display
  const sortedSelectedSkills = [...selectedSkills].sort((a: string, b: string) => {
    const skillA = a.split('|')[0];
    const skillB = b.split('|')[0];
    return skillA.localeCompare(skillB);
  });

  return (
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
  );
}
