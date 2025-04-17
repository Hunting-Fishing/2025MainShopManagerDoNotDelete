
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

const availableSkills = [
  { label: "Transmission", value: "Transmission" },
  { label: "Diagnostics", value: "Diagnostics" },
  { label: "A/C", value: "A/C" },
  { label: "Electrical", value: "Electrical" },
  { label: "Brakes", value: "Brakes" },
  { label: "Engine", value: "Engine" },
  { label: "Suspension", value: "Suspension" },
  { label: "Exhaust", value: "Exhaust" },
  { label: "Tire Service", value: "Tire Service" },
  { label: "Oil Change", value: "Oil Change" },
];

export function CertificationsSkillsFields({ control }: CertificationsSkillsFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  const [newCert, setNewCert] = useState("");

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
                </div>
                {field.value?.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {field.value?.join(", ")}
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
