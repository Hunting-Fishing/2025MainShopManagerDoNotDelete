
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Search, Star, StarOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CertificationsSkillsFieldsProps {
  control: Control<TeamMemberFormValues>;
}

// Skill categories with their skills
const skillCategories = [
  {
    id: "mechanical",
    name: "Mechanical Systems",
    icon: "🔧",
    skills: [
      { label: "Engine Repair", value: "Engine Repair" },
      { label: "Cooling System", value: "Cooling System" },
      { label: "Fuel System", value: "Fuel System" },
      { label: "Drivetrain", value: "Drivetrain" },
      { label: "Transmission", value: "Transmission" },
    ]
  },
  {
    id: "electrical",
    name: "Electrical Systems",
    icon: "⚡",
    skills: [
      { label: "Diagnostics", value: "Diagnostics" },
      { label: "ECU Programming", value: "ECU Programming" },
      { label: "Hybrid/EV Systems", value: "Hybrid/EV Systems" },
      { label: "ADAS Calibration", value: "ADAS Calibration" },
      { label: "Electrical", value: "Electrical" },
    ]
  },
  {
    id: "maintenance",
    name: "Maintenance & Service",
    icon: "🛠️",
    skills: [
      { label: "Oil Change", value: "Oil Change" },
      { label: "Tire Rotation", value: "Tire Rotation" },
      { label: "Brake Service", value: "Brake Service" },
      { label: "Fluid Flushes", value: "Fluid Flushes" },
      { label: "Brakes", value: "Brakes" },
      { label: "Tire Service", value: "Tire Service" },
    ]
  },
  {
    id: "performance",
    name: "Performance & Custom Work",
    icon: "🏎️",
    skills: [
      { label: "Exhaust Mods", value: "Exhaust Mods" },
      { label: "Suspension Lifts", value: "Suspension Lifts" },
      { label: "Tuning & Reprogramming", value: "Tuning & Reprogramming" },
      { label: "Exhaust", value: "Exhaust" },
      { label: "Suspension", value: "Suspension" },
    ]
  },
  {
    id: "body",
    name: "Body & Interior",
    icon: "🚗",
    skills: [
      { label: "Interior Repairs", value: "Interior Repairs" },
      { label: "Cosmetic Detailing", value: "Cosmetic Detailing" },
      { label: "Lighting Upgrades", value: "Lighting Upgrades" },
      { label: "Window Tinting", value: "Window Tinting" },
      { label: "A/C", value: "A/C" },
    ]
  },
];

// Flattened list of all skills (for search and other operations)
const allSkills = skillCategories.flatMap(category => 
  category.skills.map(skill => ({...skill, category: category.name}))
).sort((a, b) => a.label.localeCompare(b.label));

// Proficiency levels
const proficiencyLevels = [
  { label: "Beginner", value: "beginner", stars: 1 },
  { label: "Intermediate", value: "intermediate", stars: 3 },
  { label: "Expert", value: "expert", stars: 5 },
];

// Helper type for enhanced skills with proficiency 
interface EnhancedSkill {
  skill: string;
  proficiency: string;
}

export function CertificationsSkillsFields({ control }: CertificationsSkillsFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  const [newCert, setNewCert] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState<string>("expert");
  
  // Watch the current skills value to determine if a skill is selected
  const skillsValue = useWatch({
    control,
    name: "skills",
    defaultValue: []
  });

  // Process skills to include proficiency level
  const enhancedSkills = useMemo(() => {
    if (!Array.isArray(skillsValue)) return [];
    
    return skillsValue.map(skill => {
      if (typeof skill === 'string') {
        // Check if it's a simple string or already in the enhanced format
        if (skill.includes('|')) {
          const [skillName, proficiency] = skill.split('|');
          return {
            skill: skillName,
            proficiency: proficiency || 'expert'
          };
        }
        return {
          skill,
          proficiency: 'expert' // Default proficiency
        };
      }
      return skill;
    });
  }, [skillsValue]);
  
  // Get skill proficiency
  const getSkillProficiency = (skillName: string): string => {
    const found = enhancedSkills.find(s => s.skill === skillName);
    return found ? found.proficiency : 'expert';
  };
  
  // Check if a skill is selected
  const isSkillSelected = (skillValue: string): boolean => {
    return enhancedSkills.some(s => s.skill === skillValue);
  };

  // Handle certification addition
  const handleAddCertification = () => {
    if (newCert.trim()) {
      append({ certification_name: newCert, issue_date: "", expiry_date: "" });
      setNewCert("");
    }
  };

  // Handle skill toggle with proficiency
  const toggleSkill = (skillValue: string) => {
    const currentSkills = Array.isArray(skillsValue) ? [...skillsValue] : [];
    const enhancedCurrentSkills = enhancedSkills.slice();
    
    // Check if skill is already selected
    const existingIndex = enhancedCurrentSkills.findIndex(s => s.skill === skillValue);
    
    if (existingIndex !== -1) {
      // Remove the skill
      enhancedCurrentSkills.splice(existingIndex, 1);
    } else {
      // Add the skill with proficiency
      enhancedCurrentSkills.push({ skill: skillValue, proficiency: selectedProficiency });
    }
    
    // Convert back to format compatible with form
    const newSkillsValue = enhancedCurrentSkills.map(s => `${s.skill}|${s.proficiency}`);
    
    // Update form
    return newSkillsValue;
  };
  
  // Handle proficiency change for an existing skill
  const changeProficiency = (skillValue: string, newProficiency: string) => {
    const enhancedCurrentSkills = enhancedSkills.slice();
    const existingIndex = enhancedCurrentSkills.findIndex(s => s.skill === skillValue);
    
    if (existingIndex !== -1) {
      // Update proficiency
      enhancedCurrentSkills[existingIndex].proficiency = newProficiency;
      
      // Convert back to format compatible with form
      const newSkillsValue = enhancedCurrentSkills.map(s => `${s.skill}|${s.proficiency}`);
      return newSkillsValue;
    }
    
    return skillsValue;
  };

  // Filter skills based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return skillCategories;
    
    return skillCategories.map(category => ({
      ...category,
      skills: category.skills.filter(skill => 
        skill.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.skills.length > 0);
  }, [searchQuery]);

  // Get custom skills
  const customSkills = useMemo(() => {
    return enhancedSkills.filter(s => 
      !allSkills.some(predefined => predefined.value === s.skill)
    );
  }, [enhancedSkills]);

  // Render stars for proficiency level
  const renderStars = (proficiency: string) => {
    const level = proficiencyLevels.find(p => p.value === proficiency);
    const stars = level?.stars || 0;
    
    return (
      <div className="inline-flex ml-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < stars ? "text-yellow-500" : "text-gray-300"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Certifications</FormLabel>
        <div className="space-y-2 mt-2">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter certification..." 
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAddCertification}
              variant="outline"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 bg-background rounded-md border p-2">
                <div className="flex-1 font-medium">
                  {field.certification_name}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FormField
        control={control}
        name="skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Skills / Specialties</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Custom skill input with proficiency selection */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add custom skill..." 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1"
                  />
                  <select 
                    value={selectedProficiency}
                    onChange={(e) => setSelectedProficiency(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    {proficiencyLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <Button 
                    type="button" 
                    onClick={() => {
                      const skillValue = newSkill.trim();
                      if (skillValue && !enhancedSkills.some(s => s.skill === skillValue)) {
                        const newSkillWithProficiency = `${skillValue}|${selectedProficiency}`;
                        field.onChange([...(field.value || []), newSkillWithProficiency]);
                        setNewSkill("");
                      }
                    }}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                {/* Custom skills section */}
                {customSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Custom Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {customSkills.map((skillItem) => (
                        <Badge
                          key={skillItem.skill}
                          variant="default"
                          className="cursor-pointer bg-green-600 hover:bg-green-700 py-1 px-2"
                        >
                          <div className="flex items-center">
                            <span>{skillItem.skill}</span>
                            {renderStars(skillItem.proficiency)}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-5 w-5 p-0 text-white hover:text-white/80"
                              onClick={() => {
                                field.onChange(field.value?.filter(val => 
                                  !val.includes(skillItem.skill)
                                ) || []);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categorized skills accordion */}
                <Accordion type="multiple" className="w-full" defaultValue={["mechanical"]}>
                  {filteredCategories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <span className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {category.skills.map((skill) => {
                            const isSelected = isSkillSelected(skill.value);
                            const currentProficiency = getSkillProficiency(skill.value);

                            return (
                              <div key={skill.value} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`skill-${skill.value}`}
                                    checked={isSelected}
                                    onChange={() => {
                                      field.onChange(toggleSkill(skill.value));
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <label htmlFor={`skill-${skill.value}`} className="text-sm font-medium">
                                    {skill.label}
                                  </label>
                                </div>
                                
                                {isSelected && (
                                  <div className="flex items-center">
                                    <select
                                      value={currentProficiency}
                                      onChange={(e) => {
                                        field.onChange(changeProficiency(skill.value, e.target.value));
                                      }}
                                      className="text-xs px-2 py-1 border rounded bg-background"
                                    >
                                      {proficiencyLevels.map(level => (
                                        <option key={level.value} value={level.value}>
                                          {level.label}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="ml-2">
                                      {renderStars(currentProficiency)}
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
                
                {enhancedSkills.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-4 p-2 bg-gray-50 rounded-md">
                    <span className="font-medium">Selected Skills:</span>{' '}
                    {enhancedSkills
                      .sort((a, b) => a.skill.localeCompare(b.skill))
                      .map((s, i) => (
                        <span key={s.skill}>
                          {s.skill} ({proficiencyLevels.find(p => p.value === s.proficiency)?.label || s.proficiency})
                          {i < enhancedSkills.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    }
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
