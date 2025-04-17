
import React, { useState, useEffect, useMemo } from 'react';
import { Control, useController } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TeamMemberFormValues } from '../formValidation';
import { Search, Plus, X, Wrench, Zap, Tools, Flame, PaintRoller, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  skills: string[];
}

interface EnhancedSkillsSelectorProps {
  control: Control<TeamMemberFormValues>;
}

// Predefined skill categories with their skills
const PREDEFINED_CATEGORIES: SkillCategory[] = [
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
      'Suspension',
      'Brakes',
      'Steering',
      'Exhaust',
    ].sort(),
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
      'Wiring Repair',
      'Battery Service',
      'Lighting',
      'Starting/Charging',
    ].sort(),
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Service',
    icon: <Tools className="h-4 w-4 mr-2" />,
    skills: [
      'Oil Changes',
      'Tire Rotation',
      'Tire Balancing',
      'Brake Service',
      'Fluid Flushes',
      'Filter Replacement',
      'Inspections',
      'Scheduled Maintenance',
    ].sort(),
  },
  {
    id: 'performance',
    name: 'Performance & Custom Work',
    icon: <Flame className="h-4 w-4 mr-2" />,
    skills: [
      'Exhaust Mods',
      'Suspension Lifts',
      'Tuning',
      'Reprogramming',
      'Performance Upgrades',
      'Custom Fabrication',
      'Turbo/Supercharger',
      'Dyno Testing',
    ].sort(),
  },
  {
    id: 'body',
    name: 'Body & Interior',
    icon: <PaintRoller className="h-4 w-4 mr-2" />,
    skills: [
      'Interior Repairs',
      'Cosmetic Detailing',
      'Lighting Upgrades',
      'Window Tinting',
      'Paint Correction',
      'Panel Repair',
      'Upholstery',
      'Accessories Installation',
    ].sort(),
  },
];

// Proficiency levels with visual representation
const PROFICIENCY_LEVELS = [
  { id: 'beginner', label: 'Beginner', stars: 1 },
  { id: 'intermediate', label: 'Intermediate', stars: 3 },
  { id: 'expert', label: 'Expert', stars: 5 },
];

export function EnhancedSkillsSelector({ control }: EnhancedSkillsSelectorProps) {
  const { field } = useController({
    name: 'skills',
    control,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['mechanical']);
  const [customSkill, setCustomSkill] = useState('');

  // Parse the stored skills array into skill objects with proficiency
  const parseSkills = (skillArray: string[]): { 
    name: string; 
    proficiency: string;
    isCustom?: boolean;
  }[] => {
    return skillArray.map(skillItem => {
      if (skillItem.includes('|')) {
        const [name, proficiency] = skillItem.split('|');
        
        // Check if this is a custom skill (not in any predefined category)
        const isCustom = !PREDEFINED_CATEGORIES.some(
          category => category.skills.includes(name)
        );
        
        return { name, proficiency, isCustom };
      }
      return { name: skillItem, proficiency: 'expert', isCustom: true };
    });
  };

  // Convert skill objects back to the storage format
  const formatForStorage = (skillObjects: { name: string; proficiency: string }[]): string[] => {
    return skillObjects.map(skill => `${skill.name}|${skill.proficiency}`);
  };

  const selectedSkills = useMemo(() => parseSkills(field.value || []), [field.value]);

  const addSkill = (skillName: string, proficiency: string = 'intermediate') => {
    const normalizedName = skillName.trim();
    if (!normalizedName) return;
    
    const isAlreadySelected = selectedSkills.some(skill => skill.name.toLowerCase() === normalizedName.toLowerCase());
    
    if (!isAlreadySelected) {
      const updatedSkills = [
        ...selectedSkills, 
        { name: normalizedName, proficiency, isCustom: true }
      ];
      field.onChange(formatForStorage(updatedSkills));
    }
    
    setCustomSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = selectedSkills.filter(
      skill => skill.name !== skillToRemove
    );
    field.onChange(formatForStorage(updatedSkills));
  };

  const updateProficiency = (skillName: string, newProficiency: string) => {
    const updatedSkills = selectedSkills.map(skill => 
      skill.name === skillName 
        ? { ...skill, proficiency: newProficiency } 
        : skill
    );
    field.onChange(formatForStorage(updatedSkills));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return PREDEFINED_CATEGORIES;
    
    return PREDEFINED_CATEGORIES.map(category => ({
      ...category,
      skills: category.skills.filter(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(category => category.skills.length > 0);
  }, [searchQuery]);

  // Sort the selected skills alphabetically for display
  const sortedSelectedSkills = useMemo(() => {
    return [...selectedSkills].sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedSkills]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Add custom skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(customSkill);
              }
            }}
          />
          <Button 
            type="button" 
            size="icon" 
            onClick={() => addSkill(customSkill)}
            disabled={!customSkill.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Skills Summary */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Selected Skills:</div>
        <div className="flex flex-wrap gap-2">
          {sortedSelectedSkills.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No skills selected</div>
          ) : (
            sortedSelectedSkills.map(skill => (
              <Badge 
                key={skill.name}
                variant={skill.isCustom ? "success" : "default"}
                className="flex items-center gap-1 py-1 pr-1"
              >
                <div className="flex items-center">
                  {skill.name}
                  <span className="mx-1 text-xs opacity-70">
                    {/* Show stars based on proficiency */}
                    {Array.from({ length: PROFICIENCY_LEVELS.find(p => p.id === skill.proficiency)?.stars || 1 }).map((_, i) => (
                      <Star key={i} className="inline h-3 w-3 fill-current" />
                    ))}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full"
                  onClick={() => removeSkill(skill.name)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Skills Categorized List */}
      <Accordion 
        type="multiple" 
        value={expandedCategories} 
        onValueChange={setExpandedCategories}
        className="border rounded-md"
      >
        {filteredCategories.map(category => (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-accent">
              <div className="flex items-center">
                {category.icon}
                <span>{category.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-1 pb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {category.skills.map(skill => {
                  // Check if this skill is already selected
                  const selectedSkill = selectedSkills.find(s => s.name === skill);
                  
                  return (
                    <div key={skill} className="flex flex-col border rounded-md p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`skill-${skill.replace(/\s+/g, '-')}`}
                            checked={!!selectedSkill}
                            onChange={(e) => {
                              if (e.target.checked) {
                                addSkill(skill);
                              } else {
                                removeSkill(skill);
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`skill-${skill.replace(/\s+/g, '-')}`}>{skill}</label>
                        </div>
                      </div>
                      
                      {selectedSkill && (
                        <div className="mt-2 flex justify-between items-center text-xs">
                          <div className="flex space-x-1">
                            {PROFICIENCY_LEVELS.map(level => (
                              <button
                                key={level.id}
                                type="button"
                                onClick={() => updateProficiency(skill, level.id)}
                                className={cn(
                                  "px-2 py-1 rounded text-xs",
                                  selectedSkill.proficiency === level.id 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-secondary hover:bg-secondary/80"
                                )}
                              >
                                {level.label}
                              </button>
                            ))}
                          </div>
                        </div>
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
