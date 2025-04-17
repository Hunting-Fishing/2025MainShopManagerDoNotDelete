
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Control, useFieldArray } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EnhancedSkillsSelector } from './skills/EnhancedSkillsSelector';

interface CertificationsSkillsFieldsProps {
  control: Control<TeamMemberFormValues>;
}

export function CertificationsSkillsFields({ control }: CertificationsSkillsFieldsProps) {
  // For certifications management
  const [certName, setCertName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Use useFieldArray for proper form handling
  const { fields: certificationsFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: "certifications"
  });

  const handleAddCertification = () => {
    if (certName) {
      const newCert = {
        certification_name: certName,
        issue_date: issueDate || undefined,
        expiry_date: expiryDate || undefined
      };
      
      // Use the append method from useFieldArray
      appendCertification(newCert);
      
      // Reset form fields
      setCertName('');
      setIssueDate('');
      setExpiryDate('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Skills & Specialties</h3>
        <FormField
          control={control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills & Specialties</FormLabel>
              <FormControl>
                <EnhancedSkillsSelector control={control} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Certifications</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Certification Name</label>
              <Input 
                placeholder="ASE Certified, Manufacturer Training, etc." 
                value={certName} 
                onChange={(e) => setCertName(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Issue Date</label>
              <Input 
                type="date" 
                value={issueDate} 
                onChange={(e) => setIssueDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Expiry Date</label>
              <Input 
                type="date" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)} 
              />
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="secondary"
            onClick={handleAddCertification}
            disabled={!certName}
          >
            Add Certification
          </Button>
        </div>
        
        {/* List of added certifications */}
        {certificationsFields.length > 0 && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Certification</th>
                  <th className="px-4 py-2 text-left">Issue Date</th>
                  <th className="px-4 py-2 text-left">Expiry Date</th>
                  <th className="px-4 py-2 text-left w-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificationsFields.map((cert, index) => (
                  <tr key={cert.id} className="border-t">
                    <td className="px-4 py-2">{cert.certification_name}</td>
                    <td className="px-4 py-2">{cert.issue_date || "-"}</td>
                    <td className="px-4 py-2">{cert.expiry_date || "-"}</td>
                    <td className="px-4 py-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCertification(index)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
