
import { BaseSkillManager } from './BaseSkillManager';
import { maintenanceSkills } from "@/components/team/form/skills/categories/maintenanceSkills";

export function MaintenanceSkillsManager() {
  const initialCategories = [
    {
      name: 'Preventive Maintenance',
      skills: [
        'Oil Changes',
        'Filter Replacement',
        'Fluid Checks',
        'Tire Rotation'
      ]
    },
    {
      name: 'Brake Systems',
      skills: [
        'Brake Pad Replacement',
        'Rotor Service',
        'Brake Line Repair',
        'ABS Service'
      ]
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="Maintenance Skills" />;
}
