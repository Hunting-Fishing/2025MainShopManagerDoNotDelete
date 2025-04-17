
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control, useFieldArray } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface CertificationsSkillsFieldsProps {
  control: Control<TeamMemberFormValues>;
}

// Predefined skills list - sorted alphabetically
const availableSkills = [
  { label: "A/C", value: "A/C" },
  { label: "Brakes", value: "Brakes" },
  { label: "Diagnostics", value: "Diagnostics" },
  { label: "Electrical", value: "Electrical" },
  { label: "Engine", value: "Engine" },
  { label: "Exhaust", value: "Exhaust" },
  { label: "Oil Change", value: "Oil Change" },
  { label: "Suspension", value: "Suspension" },
  { label: "Tire Service", value: "Tire Service" },
  { label: "Transmission", value: "Transmission" },
].sort((a, b) => a.label.localeCompare(b.label));

export function CertificationsSkillsFields({ control }: CertificationsSkillsFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  const [newCert, setNewCert] = useState("");
  const [newSkill, setNewSkill] = useState("");

  // Handle certification addition
  const handleAddCertification = () => {
    if (newCert.trim()) {
      append({ certification_name: newCert, issue_date: "", expiry_date: "" });
      setNewCert("");
    }
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
              <div className="space-y-2">
                {/* Custom skill input */}
                <div className="flex gap-2 mb-2">
                  <Input 
                    placeholder="Add custom skill..." 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={() => {
                      const skillValue = newSkill.trim();
                      if (skillValue && !field.value?.includes(skillValue)) {
                        field.onChange([...(field.value || []), skillValue]);
                        setNewSkill("");
                      }
                    }}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Skills selection */}
                <div className="flex flex-wrap gap-2 border rounded-md p-2 bg-background">
                  {availableSkills.map((skill) => (
                    <Badge
                      key={skill.value}
                      variant={field.value?.includes(skill.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const currentValues = field.value || [];
                        if (currentValues.includes(skill.value)) {
                          field.onChange(currentValues.filter(val => val !== skill.value));
                        } else {
                          field.onChange([...currentValues, skill.value]);
                        }
                      }}
                    >
                      {skill.label}
                    </Badge>
                  ))}
                  
                  {/* Display custom skills as badges */}
                  {field.value?.filter(skill => !availableSkills.some(s => s.value === skill)).map((customSkill) => (
                    <Badge
                      key={customSkill}
                      variant="default"
                      className="cursor-pointer bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        field.onChange(field.value?.filter(val => val !== customSkill) || []);
                      }}
                    >
                      {customSkill} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                
                {field.value?.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {field.value?.sort().join(", ")}
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
